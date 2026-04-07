const signupForm = document.getElementById("signup-form");
const errmsg = document.getElementById('error-msg');

function validateSignupData(name, username, email, password, confirmPassword) {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
        errmsg.textContent = "Name cannot contain numbers"

        return false;
    }

    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (!usernameRegex.test(username)) {
        errmsg.textContent = "Username can only contain letters and numbers"

        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errmsg.textContent = "Please enter a valid email address"

        return false;
    }

    if (password.length < 6) {
        errmsg.textContent = "Password must be at least 6 characters long";


        return false;
    }

    if (password !== confirmPassword) {
        errmsg.textContent = "Passwords do not match";

        return false;
    }

    return true;
}

function extractSignupFormData() {
    const formData = new FormData(signupForm);

    const name = formData.get("name");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    const isValid = validateSignupData(
        name,
        username,
        email,
        password,
        confirmPassword,
    );

    if (isValid) {
        signupForm.reset();

        return { name, username, email, password };
    }
    return false;
}

async function signupUser(event) {
    event.preventDefault();
    const data = extractSignupFormData();
    const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    
    if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        document.location.href = "Login.html";
    }
}


signupForm.addEventListener("submit", signupUser);