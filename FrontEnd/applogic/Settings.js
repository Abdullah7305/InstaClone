// account.js

let usernameLabel = null;
let toggleAccountStatus = null;
let logoutBtn = null;

// --------------------
// LocalStorage helpers
// --------------------
function getToken() {
    return localStorage.getItem('token');
}

function getUserFromLocalStorage() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

// --------------------
// Logout
// --------------------
function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'Login.html';
}

// --------------------
// Load UI settings
// --------------------
function loadSettings() {
    const user = getUserFromLocalStorage();

    if (user && toggleAccountStatus) {
        toggleAccountStatus.checked =
            user.accountStatus?.toLowerCase() === 'private';
    }
}

// --------------------
// Update account status
// --------------------
async function changeAccountStatus(status) {
    try {
        const user = getUserFromLocalStorage();
        const token = getToken();

        if (!user || !user._id) return;

        const response = await fetch(
            `http://localhost:8000/user/accountStatus/${user._id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (response.ok) {
            user.accountStatus = status;
            localStorage.setItem('user', JSON.stringify(user));
        }

        console.log(data);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

// --------------------
// Toggle handler
// --------------------
function handleAccountStatus(e) {
    const status = e.target.checked ? 'private' : 'public';
    changeAccountStatus(status);
}

// --------------------
// Init
// --------------------
document.addEventListener('DOMContentLoaded', () => {
    usernameLabel = document.getElementById('username');
    toggleAccountStatus = document.getElementById('privacy-toggle');
    logoutBtn = document.getElementById('logout-btn');

    const user = getUserFromLocalStorage();

    // SIMPLE AUTH CHECK (no token validation)
    if (!user) {
        window.location.href = 'Login.html';
        return;
    }

    if (usernameLabel) {
        usernameLabel.textContent = `Logged in as @${user.username}`;
    }

    loadSettings();

    if (toggleAccountStatus) {
        toggleAccountStatus.addEventListener('change', handleAccountStatus);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});