const mesgBtn = document.getElementById('send-mesg');
const socket = io('http://localhost:8000');

function isTokenExpired(token) {
    try {

        const decode = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decode.exp < currentTime) {
            return true;
        }
    } catch (error) {
        return true;

    }

}

function getUserFromLocalStorage() {
    return JSON.parse(localStorage.getItem('user'));
}

function filterImageAddress(imageUrl) {
    imageUrl = imageUrl.replace(/\\/g, '/');
    imageUrl = imageUrl.split('uploads').pop();
    imageUrl = imageUrl.replace(/^\/+/, '');
    return imageUrl;
}

let activeUser = null;     // current chat partner ID
let messageArr = [];       // current chat messages in frontend state

// ================= LOAD CHAT LIST =================
async function loadChatSideList() {
    try {
        const currentUser = getUserFromLocalStorage();
        if (!currentUser) return;

        const response = await fetch(
            `http://localhost:8000/message/chat/list?userId=${currentUser._id}`,
            {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        const result = await response.json();
        renderChatList(result.following || []);
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

// ================= OPEN CHAT =================
function openChat(el, user, avatar) {
    document.querySelectorAll('.user-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    activeUser = user._id;
    messageArr = [];

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
        if (!currentUser) return;

        const response = await fetch(
            `http://localhost:8000/message/load?senderId=${currentUser._id}&receiverId=${receiverId}`,
            {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        const result = await response.json();
        console.log("Messages are =>", result);

        const messages = (result.userMessages || []).map(msg => ({
            type: msg.sender === currentUser._id ? 'sent' : 'received',
            text: msg.text,
            sender: msg.sender,
            receiver: msg.receiver
        }));

        messageArr = messages;
        renderMessages(messageArr);
    } catch (error) {
        console.log("Error loading messages:", error.message);
    }
}

// ================= RENDER MESSAGES (FULL RENDER) =================
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
        appendMessage(m, false);
    });

    area.scrollTop = area.scrollHeight;
}

// ================= APPEND ONE MESSAGE =================
function appendMessage(message, shouldScroll = true) {
    const area = document.getElementById('messages-area');

    const row = document.createElement('div');
    row.className = `msg-row ${message.type}`;
    row.innerHTML = `<div class="bubble">${message.text}</div>`;

    area.appendChild(row);

    if (shouldScroll) {
        area.scrollTop = area.scrollHeight;
    }
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    if (!activeUser) return;

    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    try {
        const currentUser = getUserFromLocalStorage();
        if (!currentUser) return;

        const payload = {
            mesgText: text,
            senderId: currentUser._id,
            receiverId: activeUser
        };

        // Save in backend
        const response = await fetch('http://localhost:8000/message/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("Send result =>", result);

        // Optimistic UI update or use backend response if it returns saved message
        const newMsg = {
            type: 'sent',
            text: text,
            sender: currentUser._id,
            receiver: activeUser
        };

        messageArr.push(newMsg);
        appendMessage(newMsg);

        input.value = '';
    } catch (error) {
        console.log("Error sending message:", error.message);
    }
}

// ============ MESSAGE SOCKET =============
socket.on('connect', () => {
    console.log("User Connected ", socket.id);

    const currentUser = getUserFromLocalStorage();
    if (currentUser) {
        socket.emit('register', currentUser._id);
    }
});

socket.on('send-message', (message) => {
    console.log("Message through socket is ", message);

    const currentUser = getUserFromLocalStorage();
    if (!currentUser) return;

    // Only show live message in current open chat
    const isCurrentChat =
        (message.sender === activeUser && message.receiver === currentUser._id) ||
        (message.sender === currentUser._id && message.receiver === activeUser);

    if (!isCurrentChat) return;

    const newMsg = {
        type: message.sender === currentUser._id ? 'sent' : 'received',
        text: message.text,
        sender: message.sender,
        receiver: message.receiver
    };

    // Prevent duplicate appending if same message already exists
    const alreadyExists = messageArr.some(
        m =>
            m.text === newMsg.text &&
            m.sender === newMsg.sender &&
            m.receiver === newMsg.receiver
    );

    if (alreadyExists) return;

    messageArr.push(newMsg);
    appendMessage(newMsg);
});

// ================= INIT =================
mesgBtn.addEventListener('click', sendMessage);

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
        window.location.href = 'Login.html'
    }
    await loadChatSideList();
});
