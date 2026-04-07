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
        console.log("Notification Signal Result ", result)
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

function renderNotification(notifications) {
    console.log("Notification Result", notifications);

    notificationArea.innerHTML = '';

    if (notifications.length > 0) {

        notifications.forEach(notification => {
            if (notification.notifyType == 'Follow_Request') {

                renderFollowRequest(notification);
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

notificationBtn.addEventListener('click', getDetailedNotification);

closedNotification.addEventListener('click', toggleNotifications);

document.addEventListener('DOMContentLoaded', async () => {
    await notify()
})

window.addEventListener('click', (event) => {
    const box = document.getElementById('notification-box');
    if (event.target == box) {
        box.classList.add('hidden');
    }
})
