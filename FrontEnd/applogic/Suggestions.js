const suggestionBtn = document.getElementById('suggestion-toggle');
const suggestionBox = document.getElementById('suggestion-box');
let SuggestionLoad = false;

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

function navigateSuggestedProfile(e) {
    const accountId = e.target.id;
    window.location.href = `UserProfile.html?accountId=${accountId}`;
}

async function getSuggestedUser() {
    if (SuggestionLoad == true) {
        return;
    }

    const user = getUserFromLocalStorage();

    try {
        const response = await fetch(`http://localhost:8000/user/suggestions/${user._id}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });

        const result = await response.json();

        if (response.ok) {

            suggestionBox.innerHTML = ""; // clear once before loop
            SuggestionLoad = true;
            result.suggestions.forEach(user => {

                const element = renderSuggestions(user);
                suggestionBox.appendChild(element);
            });

            return result;
        }


    } catch (error) {
        console.log("Error is getting Suggested User is ", error.message)
    }
}

function renderSuggestions(user) {
    const profilePicPathUrl = filterImageAddress(user.profilePicPathUrl);

    const container = document.createElement("div");
    container.className = "flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-white/5";

    const leftDiv = document.createElement("div");
    leftDiv.className = "flex items-center gap-3";

    const img = document.createElement("img");
    img.src = `http://localhost:8000/uploads/${profilePicPathUrl}`;
    img.className = "w-8 h-8 rounded-full object-cover border border-gray-600";

    const textDiv = document.createElement("div");
    textDiv.className = "flex flex-col";

    const usernameSpan = document.createElement("span");
    usernameSpan.className = "text-xs font-bold text-gray-200";
    usernameSpan.textContent = user.username;

    const button = document.createElement("button");
    button.id = user._id;
    button.className = "text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors";
    button.textContent = "View Profile";
    button.addEventListener('click', navigateSuggestedProfile);

    textDiv.appendChild(usernameSpan);

    leftDiv.appendChild(img);
    leftDiv.appendChild(textDiv);

    container.appendChild(leftDiv);
    container.appendChild(button);

    return container;
}


suggestionBtn.addEventListener('change', async (e) => {
    if (e.target.checked) {
        if (!SuggestionLoad) {
            await getSuggestedUser();
            SuggestionLoad = true;
        }
    } else {
        suggestionBox.innerHTML = "";
        SuggestionLoad = false;
    }
});
