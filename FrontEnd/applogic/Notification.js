const closedNotification = document.getElementById('close-notifcation');
const notificationBtn = document.getElementById('notification-btn');
const notificationArea = document.getElementById('notification-area');
let notificationsArr = [];




function getUserFromLocalStorage() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
}

// --------NOTIFICATION FUNCTIONS TO SHOW THE RED DOT---------------
async function notify() {
    const user = getUserFromLocalStorage();
    try {
        const response = await fetch(`http://localhost:8000/notification/${user._id}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        const result = await response.json();
        if (response.ok) {
            notifyOnScreen(result);
        }
        return result.message;

    } catch (error) {
        console.log("Error while loading notification ", error.message)
    }
}

function notifyOnScreen(result) {
    if (result.message === true) {
        document.getElementById('nav-notif-dot').classList.remove('hidden')
    }
}


function toggleNotifications() {
    //here we will render the notification also
    const box = document.getElementById('notification-box');
    box.classList.toggle('hidden');

}

async function handleDeleteNotification(e) {
    try {
        const notificationId = e.target.id;
        console.log("notify id is ", notificationId)
        const response = await fetch(`http://localhost:8000/notification/delete`, {
            method: 'DELETE',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ notificationId: notificationId })
        })
        const result = await response.json();


    } catch (error) {
        console.log("Erro in deleting in notification...", error.message)
    }
}


// ---------NOTIFICATION FUNCTIONS TO SHOW ACTUAL NOTIFICATION-----------

function renderFollowRequest(notification) {
    const id = notification.sender._id;

    const container = document.createElement('div');
    container.className = "flex flex-col gap-3 p-4 border-b border-white/10 transition-all hover:bg-white/5";


    const textSection = document.createElement('div');
    textSection.className = "flex flex-col";

    const userSpan = document.createElement('span');
    userSpan.className = "text-sm font-bold text-white";
    userSpan.textContent = notification.sender.username;

    const subSpan = document.createElement('span');
    subSpan.className = "text-xs text-zinc-500";
    subSpan.textContent = "wants to follow you";

    textSection.append(userSpan, subSpan);

    const btnSection = document.createElement('div');
    btnSection.className = "flex gap-2";


    const acceptBtn = document.createElement('button');
    acceptBtn.id = `accept-${id}`;
    acceptBtn.className = "flex-1 py-2 rounded-lg text-xs font-bold text-white transition-opacity active:scale-95";
    acceptBtn.style.backgroundColor = "#E1306C";
    acceptBtn.textContent = "Confirm";
    acceptBtn.addEventListener('click', acceptRequest);



    const rejectBtn = document.createElement('button');
    rejectBtn.id = `reject-${id}`;
    rejectBtn.className = "flex-1 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors active:scale-95";
    rejectBtn.textContent = "Delete";
    rejectBtn.addEventListener('click', rejectRequest)


    btnSection.append(acceptBtn, rejectBtn);
    container.append(textSection, btnSection);

    notificationArea.append(container);
}

function acceptedRequest(notification) {
    const div = document.createElement("div");
    div.className = "bg-neutral-900 p-3 rounded-lg mb-2 flex justify-between items-center";

    const text = document.createElement("p");
    text.className = "text-white text-sm";
    text.innerText = `${notification.sender.username} has accepted your request`;

    const btn = document.createElement("button");
    btn.className = "text-white text-xs";
    btn.innerText = "✕";
    btn.id = notification._id;
    btn.addEventListener('click', (e) => {
        handleDeleteNotification(e, div)
    })
    btn.onclick = () => div.remove();

    div.append(text, btn);
    notificationArea.append(div);
}

function postLike(notification) {
    const div = document.createElement("div");
    div.className = "bg-neutral-900 p-3 rounded-lg mb-2 flex justify-between items-center";

    const text = document.createElement("p");
    text.className = "text-white text-sm";
    text.innerText = `${notification.sender.username} has Like your Post`;

    const btn = document.createElement("button");
    btn.className = "text-white text-xs";
    btn.innerText = "✕";
    btn.id = notification._id;
    btn.addEventListener('click', (e) => {
        handleDeleteNotification(e, div)
    })
    btn.onclick = () => div.remove();

    div.append(text, btn);
    notificationArea.append(div);
}

function postComment(notification) {
    const div = document.createElement("div");
    div.className = "bg-neutral-900 p-3 rounded-lg mb-2 flex justify-between items-center";

    const text = document.createElement("p");
    text.className = "text-white text-sm";
    text.innerText = `${notification.sender.username} has commented on your Post`;

    const btn = document.createElement("button");
    btn.className = "text-white text-xs";
    btn.innerText = "✕";
    btn.id = notification._id;
    btn.addEventListener('click', (e) => {
        handleDeleteNotification(e, div)
    })
    btn.onclick = () => div.remove();

    div.append(text, btn);
    notificationArea.append(div);
}

function messageNotification(notification) {
    const div = document.createElement("div");
    div.className = "bg-neutral-900 p-3 rounded-lg mb-2 flex justify-between items-center";

    const text = document.createElement("p");
    text.className = "text-white text-sm";
    text.innerText = `${notification.sender.username} sent you a message`;

    const btn = document.createElement("button");
    btn.className = "text-white text-xs";
    btn.innerText = "✕";
    btn.id = notification._id;
    btn.addEventListener('click', (e) => {
        handleDeleteNotification(e);
        div.remove();
    })

    div.append(text, btn);
    notificationArea.append(div);
}

function renderNotification(notifications) {
    console.log("Notification Result", notifications);

    notificationArea.innerHTML = '';

    if (notifications.length > 0) {

        notifications.forEach(notification => {
            if (notification.notifyType == 'Follow_Request') {

                renderFollowRequest(notification);
            }
            else if (notification.notifyType == 'Accept_Request') {

                acceptedRequest(notification)
            }
            else if (notification.notifyType == 'Like') {
                postLike(notification);
            }
            else if (notification.notifyType == 'Comment') {
                postComment(notification);
            }
            else if (notification.notifyType == 'Message') {
                messageNotification(notification);
            }
        })

    }

}

async function getDetailedNotification() {
    try {
        notificationArea.innerHTML = '';
        const user = getUserFromLocalStorage();
        const response = await fetch(`http://localhost:8000/notification/details/${user._id}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        const result = await response.json();
        if (result.notification) {
            notificationsArr = result.notification;
            renderNotification(notificationsArr);
        }

        toggleNotifications();

    } catch (error) {
        console.log("Error in Brining Notification Details :", error.message)
    }
}

// --------------HANDLING THE CONFIRM AN THE REJECTED REQUEST TOGETHER----------
async function rejectRequest(e) {
    try {
        let senderId = e.target.id;
        senderId = senderId.split('-');
        senderId = senderId.pop();

        const user = getUserFromLocalStorage();
        const response = await fetch(`http://localhost:8000/request/reject`, {
            method: 'PUT',
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ sender: senderId, receiver: user._id })
        })
        const result = await response.json();
        console.log("Result for request rejection is ", result);
        e.target.disabled = true;

        toggleNotifications()

    } catch (error) {
        console.log("Error while rejecting the request is ", error.message)
    }
}

async function acceptRequest(e) {
    try {
        let senderId = e.target.id;
        senderId = senderId.split('-');
        senderId = senderId.pop();

        const user = getUserFromLocalStorage();
        const response = await fetch(`http://localhost:8000/request/accept`, {
            method: 'PUT',
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ sender: senderId, receiver: user._id })
        })
        const result = await response.json();
        console.log("Result for request rejection is ", result);
        e.target.disabled = true;

        toggleNotifications();

    } catch (error) {
        console.log("Error while rejecting the request is ", error.message)
    }
}

// -------------MESSAGE NOTIFICATION HANDLER--------------------------

async function loadSentMessageCount() {
    try {
        const response = await fetch(`http://localhost:8000/message/notify-num?receiverId=${getUserFromLocalStorage()._id}`)
        const result = await response.json();
        const mesgNotify = document.getElementById('mesg-count').textContent = result.messageNotify.length;
        console.log("Message Count is ", result);
    } catch (error) {
        console.log("Error in loading the message count is ", error.message)
    }
}

notificationBtn.addEventListener('click', getDetailedNotification);

closedNotification.addEventListener('click', toggleNotifications);



window.addEventListener('click', (event) => {
    const box = document.getElementById('notification-box');
    if (event.target == box) {
        box.classList.add('hidden');
    }
});
