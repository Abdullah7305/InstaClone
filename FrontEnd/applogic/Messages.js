function getUserFromLocalStorage() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
}
function filterImageAddress(imageUrl) {
    imageUrl = imageUrl.replace(/\\/g, '/');
    imageUrl = imageUrl.split('uploads').pop();
    imageUrl = imageUrl.replace(/^\/+/, '');
    return imageUrl;
}

let activeUser = null;

function renderChatList(list) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';


    list.forEach(user => {
        const imgUrl = filterImageAddress(user.profilePicPathUrl);

        const button = document.createElement('button');
        button.className = 'user-item';
        button.id = user._id;
        button.addEventListener('click', async (e) => {
            await loadDirectMessages(e)
        })

        const img = document.createElement('img');
        img.src = `http://localhost:8000/uploads/${imgUrl}`;
        img.className = 'user-avatar'; // for styling

        const wrapper = document.createElement('div');

        const name = document.createElement('div');
        name.className = 'user-item-name';
        name.textContent = user.username;

        const sub = document.createElement('div');
        sub.className = 'user-item-sub';
        sub.textContent = 'Tap to message';

        wrapper.appendChild(name);
        wrapper.appendChild(sub);

        button.appendChild(img);
        button.appendChild(wrapper);

        userList.appendChild(button);
    });
}

async function loadDirectMessages(e) {
    try {
        const user = getUserFromLocalStorage();
        const receiverId = e.target.id;
        console.log("Receiver id is ", receiverId);
        const response = await fetch(`http://localhost:8000/message/load?senderId=${user._id}&receiverId=${receiverId}`, {
            method: 'GET',
            headers: {

                "authorization": `Bearer  ${localStorage.getItem('token')}`
            }
        })
        const result = await response.json();
        console.log("DM messages are ", result);
    } catch (error) {
        console.log("Error while loading the messages are ", error.message)
    }
}

async function loadChatSideList() {
    try {

        const response = await fetch(`http://localhost:8000/message/chat/list?userId=${getUserFromLocalStorage()._id}`, {
            method: 'GET',
            "authorization": `Bearer ${localStorage.getItem('token')}`
        })

        const result = await response.json();

        console.log("Result for loading the chat list is ", result);

        renderChatList(result.following);

    } catch (error) {
        console.log("Error on loading the chat list is ", error.message);

    }
}

function openChat(el, user, avatar,e) {
    document.querySelectorAll('.user-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    activeUser = user;

    document.getElementById('chat-topbar').style.display = 'flex';
    document.getElementById('chat-avatar').src = avatar;
    document.getElementById('chat-name').textContent = user;


    renderMessages();
}

function sendMessage() {
    if (!activeUser) return;

    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;

    chats[activeUser].push({ type: 'sent', text });

    // fake reply
    setTimeout(() => {
        chats[activeUser].push({ type: 'received', text: "Reply: " + text });
        renderMessages();
    }, 500);

    input.value = '';
    renderMessages();
}

function renderMessages() {
    const area = document.getElementById('messages-area');

    if (!activeUser) {
        area.innerHTML = `
      <div class="empty-state">
        <p>No chat selected</p>
        <p style="font-size:12px;">Select a user to start messaging</p>
      </div>
    `;
        return;
    }

    const msgs = chats[activeUser];
    area.innerHTML = '';

    if (msgs.length === 0) {
        area.innerHTML = `
      <div class="empty-state">
        <p>No messages yet</p>
        <p style="font-size:12px;">Start the conversation</p>
      </div>
    `;
        return;
    }

    msgs.forEach(m => {
        const row = document.createElement('div');
        row.className = `msg-row ${m.type}`;
        row.innerHTML = `<div class="bubble">${m.text}</div>`;
        area.appendChild(row);
    });

    area.scrollTop = area.scrollHeight;
}


document.addEventListener('DOMContentLoaded', async () => {
    await loadChatSideList()
})