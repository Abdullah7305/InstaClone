const followBtn = document.getElementById('mainFollowBtn');
const postArea = document.getElementById('post-area');
const socket = io("http://localhost:8000");
const postsComments = [];

let accountId = '';

// --- Helper Functions ---

function getUserFromLocalStorage() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
}

function filterImageAddress(path) {
    if (!path) return null;
    return path.startsWith('/') ? path.substring(1) : path;
}

function populateAccountData(result) {
    const accountImg = document.getElementById('user-img');
    const username = document.getElementById('username-profile');
    const userBio = document.getElementById('userBio');

    if (result.img == undefined) {
        accountImg.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
    } else {
        accountImg.src = `http://localhost:8000/uploads/${result.img}`;
    }

    username.textContent = result.username;
    userBio.textContent = result.bio;
}

// --------------Comment-------------------
async function postComment(postId, commentText) {
    try {
        const user = getUserFromLocalStorage();
        console.log("User id is ", user._id)
        console.log("PostId is ", postId)
        console.log("Comment Text is ", commentText)
        const response = await fetch(`http://localhost:8000/post/user/comment/${user._id}`, {
            method: 'POST',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
                "content-type": "application/json"
            },
            
            body: JSON.stringify({ postId: postId, commentText: commentText })
        });
        const result = await response.json();
        console.log("Result for comment posting is ", result);

        // Optional: You can trigger a re-render here to show the new comment instantly
        // renderProfilePost(accountId, document.getElementById('username-profile').textContent, result.img);

    } catch (error) {
        console.log("Comment Posting Error is ", error.message);
    }
}

// ---------LIKE FUNCTIONALITY (copied/adapted from Account.js) ----------
async function likePostEvent(e, likeCountText) {
    const btn = (e && e.currentTarget) || (e && e.target && e.target.closest && e.target.closest('button'));
    if (!btn) {
        console.log('likePostEvent: button not found on event', e);
        return;
    }
    const postId = btn.id;
    const userId = getUserFromLocalStorage()._id;
    try {
        const response = await fetch('http://localhost:8000/post/likes', {
            method: 'POST',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ postId: postId, userId: userId })
        })
        const result = await response.json();
        console.log("Like Event Happen", result);

        // Toggle UI class and update count optimistically
        btn.classList.toggle('text-pink-500');
        // Update svg fill to follow the class
        const svgEl = btn.querySelector && btn.querySelector('svg');
        if (svgEl) svgEl.setAttribute('fill', btn.classList.contains('text-pink-500') ? 'currentColor' : 'none');

        let count = parseInt(likeCountText.innerText) || 0;
        if (btn.classList.contains('text-pink-500')) count++;
        else count = Math.max(0, count - 1);
        likeCountText.innerText = count;

    } catch (error) {
        console.log("Error while liking the post is ", error)
    }
}

async function loadLikesForUser() {
    try {
        const user = getUserFromLocalStorage();
        const response = await fetch(`http://localhost:8000/post/likes?userid=${user._id}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
                "content-type": "application/json"
            }
        });
        const result = await response.json();
        console.log("Likes loading result is ", result);
    } catch (error) {
        console.log("Error in loading likes is ", error.message)
    }
}

// --- Main Application Logic ---

async function profileUser() {
    let url = window.location.search;
    accountId = new URLSearchParams(url).get('accountId');

    try {
        const response = await fetch(`http://localhost:8000/user/profile/${accountId}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();

        // Populate the top header of the page
        populateAccountData(result);

        // Handle Follow Button logic...
        if (result.requestStatus === 'Accepted') {
            followBtn.textContent = 'Following';
        } else if (result.requestStatus === 'Requested') {
            followBtn.textContent = 'Requested';
        } else {
            followBtn.textContent = 'Follow';
        }

        // Logic to show posts: Pass username and img as extra parameters
        if (result.accountStatus === 'public' || result.requestStatus === 'Accepted') {
            await renderProfilePost(accountId, result.username, result.img);

        } else {
            postArea.innerHTML = `<p class="text-center py-20 text-gray-500">This Account is Private</p>`;
        }

    } catch (error) {
        console.log("Error in Loading Profile:", error.message);
    }
}

async function followRequest() {
    if (accountId == '' || !accountId) {
        console.log("No Account Id Exist....");
        return;
    }
    try {
        const user = getUserFromLocalStorage();

        const response = await fetch(`http://localhost:8000/request/follow/${accountId}`, {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ userId: `${user._id}` })
        });
        const result = await response.json();
        result.message == 'requested' ? followBtn.textContent = 'Requested' : followBtn.textContent = 'Follow';
        console.log("Follow Result is ", result);
    } catch (error) {
        console.log("Error in follow request is ", error.message);
    }
}

async function getUserProfilePost(accountId) {
    try {
        console.log("Profile Id is ", accountId);
        const response = await fetch(`http://localhost:8000/user/posts/${accountId}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });
        const result = await response.json();
        console.log("Result for Profile Post is ", result);
        return result;
    } catch (error) {
        console.log("Error in loading Post is ", error.message);
    }
}

async function renderProfilePost(id, profileUsername, profilePic) {
    if (!postArea) return;

    const result = await getUserProfilePost(id);
    postArea.innerHTML = '';


    const postsArray = result.postsWithComments || [];

    if (postsArray.length === 0) {
        postArea.innerHTML = '<p class="text-gray-500 text-center w-full py-10">No posts yet.</p>';
        return;
    }

    postsArray.forEach(postData => {
        // We pass the profile owner's name and pic to the card creator
        const { card } = createPostCard(postData, profileUsername, profilePic);
        postArea.appendChild(card);
    });
}

function createPostCard(postData, username, pfp) {
    const user = getUserFromLocalStorage();
    const fallbackImage = 'https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80';
    const card = document.createElement('article');

    card.className = 'flex flex-col mb-8 rounded-xl overflow-hidden w-full mx-auto';
    card.style.maxWidth = '450px';
    card.style.background = 'var(--card)';
    card.style.border = '1px solid var(--border)';

    const header = document.createElement('div');
    header.className = 'flex items-center p-3 border-b border-[#2e2e2e]';

    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center gap-3';

    const profileImg = document.createElement('img');
    profileImg.className = 'w-10 h-10 rounded-full object-cover border border-[#3e3e3e]';
    const cleanPfpPath = filterImageAddress(pfp);
    profileImg.src = cleanPfpPath ? `http://localhost:8000/uploads/${cleanPfpPath}` : fallbackImage;
    profileImg.onerror = () => { profileImg.src = fallbackImage; };

    const userTextDiv = document.createElement('div');
    userTextDiv.className = 'flex flex-col';
    userTextDiv.innerHTML = `<span class="font-bold text-sm text-white">${username || 'User'}</span>`;

    userInfo.append(profileImg, userTextDiv);
    header.appendChild(userInfo);


    const imgWrap = document.createElement('div');
    imgWrap.className = 'w-full aspect-video bg-black overflow-hidden';
    const image = document.createElement('img');
    image.className = 'w-full h-full object-cover';
    const cleanPostImg = filterImageAddress(postData.imageUrl);
    image.src = cleanPostImg ? `http://localhost:8000/uploads/${cleanPostImg}` : fallbackImage;
    image.onerror = () => { image.src = fallbackImage; };
    imgWrap.appendChild(image);


    const footer = document.createElement('div');
    footer.className = 'p-4 flex flex-col gap-3';
    footer.innerHTML = `
        <div class="flex items-center gap-2 text-white">
            <button class="hover:text-pink-500 transition-colors bg-transparent border-none p-0 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
            <span class="text-gray-400 text-sm font-medium">${postData.likesCount || 0}</span>
        </div>
        <div class="flex flex-col gap-1">
            <span class="font-bold text-lg text-white">${postData.title}</span>
            <p class="text-gray-400 text-sm line-clamp-2">${postData.description}</p>
        </div>
    `;


    const commentContainer = document.createElement('div');
    commentContainer.className = 'px-4 pb-4 border-t border-[#2e2e2e] flex flex-col gap-2';

    const commentList = document.createElement('div');
    commentList.className = 'max-h-32 overflow-y-auto py-2 flex flex-col gap-2 custom-scrollbar';
    commentList.style.scrollbarWidth = 'thin';


    if (postData.comments && postData.comments.length > 0) {
        postData.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'text-sm mb-1';


            const commentUsername = comment.user && comment.user.username ? comment.user.username : (getUserFromLocalStorage()?.username || 'User');

            commentDiv.innerHTML = `
                <span class="font-bold text-gray-200 mr-2">${commentUsername}</span>
                <span class="text-gray-300">${comment.commentText}</span>
            `;
            commentList.appendChild(commentDiv);
        });
    } else {
        commentList.innerHTML = `<span class="text-xs text-gray-500 italic">No comments yet.</span>`;
    }

    const inputRow = document.createElement('div');
    inputRow.className = 'flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-[#333]';

    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Add a comment...';
    commentInput.className = 'bg-transparent border-none outline-none text-xs text-white flex-1';

    const sendBtn = document.createElement('button');
    sendBtn.className = 'text-pink-500 hover:scale-110 transition-transform cursor-pointer bg-transparent border-none p-0 flex items-center';

    const svgNS = "http://www.w3.org/2000/svg";
    const sendSvg = document.createElementNS(svgNS, "svg");
    sendSvg.setAttribute("width", "18");
    sendSvg.setAttribute("height", "18");
    sendSvg.setAttribute("viewBox", "0 0 24 24");
    sendSvg.setAttribute("fill", "none");
    sendSvg.setAttribute("stroke", "currentColor");
    sendSvg.setAttribute("stroke-width", "2");

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", "22"); line.setAttribute("y1", "2");
    line.setAttribute("x2", "11"); line.setAttribute("y2", "13");

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", "22 2 15 22 11 13 2 9 22 2");

    sendSvg.append(line, polygon);
    sendBtn.appendChild(sendSvg);

    inputRow.append(commentInput, sendBtn);

    sendBtn.addEventListener('click', () => {
        const val = commentInput.value.trim();
        if (val) {
            postComment(postData._id, val);


            const newCommentDiv = document.createElement('div');
            newCommentDiv.className = 'text-sm mb-1';
            const storedUser = getUserFromLocalStorage();
            const commentUsername = storedUser && storedUser.username ? storedUser.username : 'User';
            newCommentDiv.innerHTML = `
                <span class="font-bold text-gray-200 mr-2">${commentUsername}</span>
                <span class="text-gray-300">${val}</span>
            `;


            if (postData.comments.length === 0 && commentList.querySelector('.italic')) {
                commentList.innerHTML = '';
            }

            commentList.appendChild(newCommentDiv);

            commentInput.value = '';
        }
        else {
            console.log("No Comment text there")
        }
    });

    commentContainer.append(commentList, inputRow);

    card.append(header, imgWrap, footer, commentContainer);

    // wire like button behavior and initial like state without changing card layout
    try {
        const likeBtn = footer.querySelector('button');
        const likeCountText = footer.querySelector('span');
        if (likeBtn && likeCountText) {
            likeBtn.id = postData._id;

            // Initialize like count from likes array if available
            if (Array.isArray(postData.likes)) {
                likeCountText.innerText = postData.likes.length;
            } else {
                likeCountText.innerText = postData.likesCount || 0;
            }

            const currentUserId = getUserFromLocalStorage() && getUserFromLocalStorage()._id;
            const hasLiked = Array.isArray(postData.likes) ? postData.likes.includes(currentUserId) : false;
            if (hasLiked) likeBtn.classList.add('text-pink-500');

            // Set SVG fill to reflect like state
            const svg = likeBtn.querySelector('svg');
            if (svg) svg.setAttribute('fill', hasLiked ? 'currentColor' : 'none');

            likeBtn.addEventListener('click', (e) => likePostEvent(e, likeCountText));
        }
    } catch (err) {
        console.log('Error wiring like button', err);
    }

    return { card };
}


socket.on('connect', () => {
    console.log("User Connected ", socket.id);
    socket.emit("register", getUserFromLocalStorage()._id);
})


followBtn.addEventListener('click', async () => {
    await followRequest();
});

document.addEventListener('DOMContentLoaded', async () => {
    await profileUser();
    await loadLikesForUser();
});