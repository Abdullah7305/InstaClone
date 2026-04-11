const signinBtn = document.getElementById('signin-btn');

function validateLoginData(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return false;
    }

    if (password.length < 6) {
        return false;
    }
    return true;
}

function extractLogin() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = emailInput.value;
    const password = passwordInput.value;
    const isValid = validateLoginData(email, password);
    console.log("Validation is ", email, password)
    if (isValid) {
        return { email: email, password: password };
    }
    return false;
}

async function loginRequest(event) {
    event.preventDefault();
    const loginData = extractLogin();
    try {
        if (loginData == false) {
            throw new Error("Data is Not Valid");
        }
        const response = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(loginData)
        });
        const result = await response.json();
        console.log("Result on login is ", result);
        if (response.ok) {
            // setTokenCookie(result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            localStorage.setItem("token", (result.token));
            document.location.href = "Home.html";
        }
        console.log("Result While loggin in is ", result);

    } catch (error) {
        const errmsg = document.getElementById('error-msg');
        errmsg.textContent = error
        console.log("Error while logging in is ", error)
    }
}

signinBtn.addEventListener('click', loginRequest);
