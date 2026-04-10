const mesgBtn = document.getElementById('send-mesg');

function getUserFromLocalStorage() {
    return JSON.parse(localStorage.getItem('user'));
}

function filterImageAddress(imageUrl) {
    imageUrl = imageUrl.replace(/\\/g, '/');
    imageUrl = imageUrl.split('uploads').pop();
    imageUrl = imageUrl.replace(/^\/+/, '');
    return imageUrl;
}

let activeUser = null; // will store USER ID

// ================= LOAD CHAT LIST =================
async function loadChatSideList() {
    try {
        const response = await fetch(
            `http://localhost:8000/message/chat/list?userId=${getUserFromLocalStorage()._id}`,
            {
                method: 'GET',
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        const result = await response.json();
        renderChatList(result.following);

    } catch (error) {
        console.log("Error loading chat list:", error.message);
    }
}

// ================= RENDER CHAT LIST =================
function renderChatList(list) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    list.forEach(user => {
        const imgUrl = filterImageAddress(user.profilePicPathUrl);
        const avatar = `http://localhost:8000/uploads/${imgUrl}`;

        const button = document.createElement('button');
        button.className = 'user-item';
        button.id = user._id;

        button.innerHTML = `
            <img src="${avatar}" class="user-avatar"/>
            <div>
                <div class="user-item-name">${user.username}</div>
                <div class="user-item-sub">Tap to message</div>
            </div>
        `;


        button.addEventListener('click', async () => {
            openChat(button, user, avatar);
            await loadDirectMessages(user._id);
        });

        userList.appendChild(button);
    });
}

// ================= OPEN CHAT (UI CONTROL) =================
function openChat(el, user, avatar) {
    document.querySelectorAll('.user-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    activeUser = user._id;

    document.getElementById('chat-topbar').style.display = 'flex';
    document.getElementById('chat-avatar').src = avatar;
    document.getElementById('chat-name').textContent = user.username;


    document.querySelector('.input-bar').classList.remove('hidden');


    document.getElementById('messages-area').innerHTML = '';
}

// ================= LOAD MESSAGES =================
async function loadDirectMessages(receiverId) {
    try {
        const currentUser = getUserFromLocalStorage();

        const response = await fetch(
            `http://localhost:8000/message/load?senderId=${currentUser._id}&receiverId=${receiverId}`,
            {
                method: 'GET',
                headers: {
                    "authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        const result = await response.json();

        const messages = result.userMessages.map(msg => ({
            type: msg.sender === currentUser._id ? 'sent' : 'received',
            text: msg.text
        }));

        renderMessages(messages);

    } catch (error) {
        console.log("Error loading messages:", error.message);
    }
}

// ================= RENDER MESSAGES =================
function renderMessages(messages = []) {
    const area = document.getElementById('messages-area');
    area.innerHTML = '';

    if (messages.length === 0) {
        area.innerHTML = `
            <div class="empty-state">
                <p>No messages yet</p>
                <p style="font-size:12px;">Start the conversation</p>
            </div>
        `;
        return;
    }

    messages.forEach(m => {
        const row = document.createElement('div');
        row.className = `msg-row ${m.type}`;
        row.innerHTML = `<div class="bubble">${m.text}</div>`;
        area.appendChild(row);
    });

    area.scrollTop = area.scrollHeight;
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    if (!activeUser) return;

    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    try {
        const currentUser = getUserFromLocalStorage();

        await fetch(`http://localhost:8000/message/send`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                mesgText: text,
                senderId: currentUser._id,
                receiverId: activeUser
            })
        });

        input.value = '';


        await loadDirectMessages(activeUser);

    } catch (error) {
        console.log("Error sending message:", error.message);
    }
}

// ================= INIT =================

mesgBtn.addEventListener('click', sendMessage)

document.addEventListener('DOMContentLoaded', async () => {
    await loadChatSideList();
});