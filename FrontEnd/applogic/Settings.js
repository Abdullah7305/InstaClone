const usernameLabel = document.getElementById('username'); // Renamed slightly to avoid conflict
const toggleAccountStatus = document.getElementById('privacy-toggle');
const logoutBtn = document.getElementById('logout-btn');


function getUserFromLocalStorage() {
    return JSON.parse(localStorage.getItem('user'));
}

function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'Login.html';
}

function loadSettings() {
    const user = getUserFromLocalStorage();

    if (user && user.accountStatus && toggleAccountStatus) {

        toggleAccountStatus.checked = (user.accountStatus.toLowerCase() === 'private');

        console.log("Loaded status:", user.accountStatus, "Checkbox is:", toggleAccountStatus.checked);
    }
}

async function changeAccountStatus(status) {
    try {
        const user = getUserFromLocalStorage();
      
        const response = await fetch(`http://localhost:8000/user/accountStatus/${user._id}`, {
            method: 'PATCH',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ status: status })
        });

        if (response.ok) {
            let updatedUser = getUserFromLocalStorage();
            updatedUser.accountStatus = status;
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        const result = await response.json();
        console.log("Status updated to:", status);
    } catch (error) {
        console.log("Error while changing account status:", error.message);
    }
}

async function handleAccountStatus(e) {

    const status = e.target.checked ? "private" : "public";
    await changeAccountStatus(status);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const user = getUserFromLocalStorage();
    if (user) {
        usernameLabel.textContent = `Logged in as @${user.username}`;
    }
    loadSettings();
});

toggleAccountStatus.addEventListener('change', async (e) => {
    await handleAccountStatus(e);
});

logoutBtn.addEventListener('click', handleLogout)