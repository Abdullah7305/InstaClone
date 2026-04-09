
const chats = {
    luna_arc: [],
    josh_trips: []
};

let activeUser = null;

function openChat(el, user, avatar) {
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
