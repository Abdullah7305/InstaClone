// const jwtDe
const fileInput = document.getElementById('create-post-file');
const postTitle = document.getElementById('post-title');
const postDescription = document.getElementById('post-caption');
const previewImg = document.getElementById('create-post-preview');
const placeholder = document.getElementById('placeholder-content');
const createForm = document.getElementById('create-post-form');
const submitPostBtn = document.getElementById("submit-post-btn");
const homeProfilePic = document.getElementById('home-profile-pic');
const homeProfileName = document.getElementById('home-profile-name');

function isTokenExpired(token) {
    try {

        const decode = jwtDecode(token);
        const currentTime = Date.now();

        if (decode.exp < currentTime) {
            return true;
        }
    } catch (error) {
        return true;

    }

}

const socket = io("http://localhost:8000");

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

// -----------LIKE POST-------------
async function likePostEvent(e, likeCountText) {
    const btn = (e && e.currentTarget) || (e && e.target && e.target.closest && e.target.closest('button'));
    if (!btn) return console.log('likePostEvent: button not found');
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
        });
        const result = await response.json();
        console.log('Like Event Happen', result);

        // Toggle UI and update svg fill
        btn.classList.toggle('text-pink-500');
        const svgEl = btn.querySelector && btn.querySelector('svg');
        if (svgEl) svgEl.setAttribute('fill', btn.classList.contains('text-pink-500') ? 'currentColor' : 'none');

        let count = parseInt(likeCountText.innerText) || 0;
        if (btn.classList.contains('text-pink-500')) count++;
        else count = Math.max(0, count - 1);
        likeCountText.innerText = count;

    } catch (error) {
        console.log('Error while liking the post is ', error);
    }
}

// -----------COMMENT POST-----------
async function postCommentToServer(postId, commentText) {
    try {
        const user = getUserFromLocalStorage();
        const response = await fetch(`http://localhost:8000/post/user/comment/${user._id}`, {
            method: 'POST',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ postId: postId, commentText: commentText })
        });
        const result = await response.json();
        console.log('Result for comment posting is ', result);
    } catch (error) {
        console.log('Comment Posting Error is ', error.message);
    }
}

// --- Preview the Image ---
function handleImagePreview(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// --- Validate Data -> EXTRACT DATA -> GET THE POSTS -> REDNER THE POST---
function validatePostData(title, caption, imageFile) {
    if (!imageFile) {
        alert("Please select an image!");
        return false;
    }
    if (!title.trim() || !caption.trim()) {
        alert("Title and Caption are required!");
        return false;
    }
    return true;
}

function formDataExtraction(e) {
    //here we will extract the form data and then we will call the api then
    e.preventDefault();
    const postData = new FormData();
    postData.append('image', fileInput.files[0]);
    postData.append('title', postTitle.value);
    postData.append('description', postDescription.value);

    return postData;

}

async function submitPostData(e) {
    e.target.disabled = true;
    const postData = formDataExtraction(e);
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("User is ", user._id);
    try {
        const response = await fetch(`http://localhost:8000/post/${user._id}`, {
            method: 'POST',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: postData
        })
        console.log("Try...")
        const result = response.json();
        console.log("Result in Posting the Post is ", result);
    } catch (error) {
        console.log("Error while Posting Post Data is  ", error.message)
    }
}

async function getHomePost() {
    try {
        const user = getUserFromLocalStorage();
        const response = await fetch(`http://localhost:8000/post/allposts?userId=${user._id}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        const result = await response.json();
        console.log("Result in Getting the Post is ", result);
        return result.postsWithComments;
    } catch (error) {
        console.error("Error while fetching home posts:", error);
    }
}

function createPostCard(postData) {
    const user = getUserFromLocalStorage();
    const userPfp = filterImageAddress(user?.profilePicPathUrl);
    const card = document.createElement('article');
    const fallbackImage = 'https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80';

    card.className = 'flex flex-col mb-8 rounded-xl overflow-hidden w-full mx-auto';
    card.style.cssText = 'max-width: 450px; background: var(--card); border: 1px solid var(--border);';

    // Header & Media (Simplified)
    const header = document.createElement('div');
    header.className = 'flex items-center gap-3 p-3 border-b border-[#2e2e2e]';
    const authorUsername = postData.username || user.username || 'User';
    const authorPfpPath = postData.profilePicPathUrl ? filterImageAddress(postData.profilePicPathUrl) : userPfp;
    if (postData.userId != user._id) {
        header.innerHTML = `<img class="w-10 h-10 rounded-full object-cover border border-[#3e3e3e]" src="${authorPfpPath ? `http://localhost:8000/uploads/${authorPfpPath}` : fallbackImage}" onerror="this.src='${fallbackImage}'"><a href="UserProfile.html?accountId=${postData.userId}" class="font-bold text-sm text-white">${authorUsername}</a>`;
    }
    else {
        header.innerHTML = `<img class="w-10 h-10 rounded-full object-cover border border-[#3e3e3e]" src="${authorPfpPath ? `http://localhost:8000/uploads/${authorPfpPath}` : fallbackImage}" onerror="this.src='${fallbackImage}'"><span  class="font-bold text-sm text-white">${authorUsername}</span>`;
    }

    const imgWrap = document.createElement('div');
    const cleanPostImg = postData.imageUrl ? filterImageAddress(postData.imageUrl) : null;
    imgWrap.className = 'w-full aspect-video bg-black overflow-hidden';
    imgWrap.innerHTML = `<img class="w-full h-full object-cover" src="${cleanPostImg ? `http://localhost:8000/uploads/${cleanPostImg}` : fallbackImage}">`;

    // Footer - ADDED COMMENT BUTTON HERE
    const footer = document.createElement('div');
    footer.className = 'p-4 flex flex-col gap-3';
    footer.innerHTML = `
        <div class="flex items-center gap-4 text-white">
            <div class="flex items-center gap-2">
                <button class="hover:text-pink-500 transition-all cursor-pointer bg-transparent border-none p-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <span class="text-gray-400 text-sm font-medium">${postData.likesCount || 0}</span>
            </div>
            <button class="comment-trigger-btn hover:text-gray-300 transition-all cursor-pointer bg-transparent border-none p-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </button>
        </div>
        <div class="font-bold text-lg text-white mt-1">${postData.title}</div>
        <p class="text-gray-400 text-sm line-clamp-2">${postData.description}</p>
    `;

    // Comment Section (Now styled to fit inside the modal)
    const commentSection = document.createElement('div');
    commentSection.className = 'flex flex-col h-full bg-[#1c1c1c] w-full';

    const commentList = document.createElement('div');
    commentList.className = 'flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar';
    commentList.style.scrollbarWidth = 'thin';

    const inputRow = document.createElement('div');
    inputRow.className = 'flex items-center gap-2 bg-[#1a1a1a] px-4 py-3 border-t border-[#333] mt-auto';
    inputRow.innerHTML = `
        <input type="text" placeholder="Add comment..." class="bg-transparent border-none outline-none text-sm text-white flex-1">
        <button class="text-pink-500 cursor-pointer font-bold text-sm">Post</button>
    `;

    const input = inputRow.querySelector('input');
    const sendBtn = inputRow.querySelector('button');


    const createCommentElement = (text, author = { username: 'Guest' }, isReply = false) => {
        const div = document.createElement('div');
        div.className = `flex flex-col gap-1 ${isReply ? 'ml-6 border-l-2 border-[#333] pl-3' : ''}`;
        div.innerHTML = `
            <div class="text-xs text-gray-300 bg-[#262626] p-2 rounded relative">
                <span class="font-bold text-white mr-2">${(author && author.username) || 'Guest'}</span>
                <span>${text}</span>
                <div class="flex gap-3 mt-2 text-[10px] font-semibold uppercase tracking-wider">
                    <button class="like-comment text-gray-500 hover:text-pink-500 transition-colors">Like</button>
                    <button class="reply-comment text-gray-500 hover:text-white transition-colors">Reply</button>
                </div>
            </div>
        `;

        div.querySelector('.like-comment').onclick = (e) => {
            e.target.classList.toggle('text-pink-500');
            e.target.innerText = e.target.innerText === 'LIKE' ? 'LIKED' : 'LIKE';
        };

        div.querySelector('.reply-comment').onclick = () => {
            input.value = `@${user?.username} `;
            input.focus();
        };

        return div;
    };

    sendBtn.onclick = async () => {
        if (!input.value.trim()) return;
        const isReply = input.value.startsWith('@');
        await postCommentToServer(postData._id, input.value.trim());
        commentList.appendChild(createCommentElement(input.value, isReply));
        input.value = '';
        commentList.scrollTop = commentList.scrollHeight;
    };

    commentSection.append(commentList, inputRow);

    // IMPORTANT: We no longer append commentSection directly to the card.
    card.append(header, imgWrap, footer);

    // Wire up the new Comment button to open the modal
    const commentTriggerBtn = footer.querySelector('.comment-trigger-btn');
    commentTriggerBtn.addEventListener('click', () => {
        const modal = document.getElementById('global-comment-modal');
        const modalBody = document.getElementById('comment-modal-body');

        // Clear old comments from the modal and inject this post's comments
        modalBody.innerHTML = '';
        modalBody.appendChild(commentSection);

        // Populate existing comments for this post
        if (Array.isArray(postData.comments) && postData.comments.length > 0) {
            postData.comments.forEach(c => {
                const author = c.user || { username: 'Guest' };
                const text = c.commentText || '';
                commentList.appendChild(createCommentElement(text, author, false));
            });
            // scroll to bottom so newest comments are visible
            commentList.scrollTop = commentList.scrollHeight;
        }

        // Unhide the modal
        modal.classList.remove('hidden');
    });

    // wire like button behavior and initial like state (Unchanged)
    try {
        const likeBtn = footer.querySelector('button'); // This still safely grabs the FIRST button (the heart)
        const likeCountText = footer.querySelector('span'); // This still safely grabs the FIRST span (the count)
        if (likeBtn && likeCountText) {
            likeBtn.id = postData._id;

            if (Array.isArray(postData.likes)) {
                likeCountText.innerText = postData.likes.length;
            } else {
                likeCountText.innerText = postData.likesCount || 0;
            }

            const currentUserId = getUserFromLocalStorage() && getUserFromLocalStorage()._id;
            const hasLiked = Array.isArray(postData.likes) ? postData.likes.includes(currentUserId) : false;
            if (hasLiked) {
                likeBtn.classList.add('text-pink-500');
                const svg = likeBtn.querySelector('svg');
                if (svg) svg.setAttribute('fill', 'currentColor');
            }

            likeBtn.addEventListener('click', (e) => likePostEvent(e, likeCountText));
        }
    } catch (err) {
        console.log('Error wiring like button', err);
    }

    return { card };
}

async function renderAccountPosts() {
    const user = getUserFromLocalStorage();
    const posts = await getHomePost();
    const postArea = document.getElementById('post-home-area');
    const loadingBeats = document.getElementById('loading-beats');

    let profilePicPathUrl = filterImageAddress(user.profilePicPathUrl);
    homeProfileName.textContent = user.username;
    if (!profilePicPathUrl) {
        homeProfilePic.src = "https://i.pinimg.com/474x/1d/ec/e2/1dece2c8357bdd7cee3b15036344faf5.jpg"
    }
    else {

        homeProfilePic.src = `http://localhost:8000/uploads/${profilePicPathUrl}`
    }
    postArea.innerHTML = '';

    if (posts) {
        loadingBeats.innerHTML = '';
        posts.forEach(post => {
            // Destructure the object to get the 'card' element

            const { card } = createPostCard(post);

            // FIX: Append ONLY the card node
            postArea.appendChild(card);

        });
    }
    else {
        postArea.appendChild(loadingBeats)
    }


}

socket.on("connect", () => {
    console.log("Connected to server: ", socket.id);
    socket.emit("register", getUserFromLocalStorage()._id);
});



socket.on('follow-request', (data) => {
    console.log("Socket incoming data is ", data);
    const dot = document.getElementById('nav-notif-dot');
    if (dot) dot.classList.remove('hidden');
})

socket.on("accept-request", (data) => {
    console.log("Socket incoming data is ", data);
    const dot = document.getElementById('nav-notif-dot');
    if (dot) dot.classList.remove('hidden');
})

socket.on('post-upload', (postData) => {
    console.log("Post through socket is ", postData)

})

socket.on('like-post', (username) => {
    const dot = document.getElementById('nav-notif-dot');
    if (dot) dot.classList.remove('hidden');

})

socket.on('post-comment', (username) => {
    console.log("Comment Socket is =======>>>", username);
    const dot = document.getElementById('nav-notif-dot');
    if (dot) dot.classList.remove('hidden');
})

// Show pink dot and increment message count when a new message arrives
socket.on('send-message', (message) => {
    console.log("Message through socket is ", message);
    const dot = document.getElementById('nav-notif-dot');
    if (dot) dot.classList.remove('hidden');

    const mesgCountEl = document.getElementById('mesg-count');
    if (mesgCountEl) {
        const current = parseInt(mesgCountEl.textContent) || 0;
        mesgCountEl.textContent = current + 1;
    }
});

// Update like counts live when any user likes/unlikes a post
socket.on('post-liked', (data) => {
    try {
        const { postId, likesCount } = data;
        const likeBtn = document.getElementById(postId);
        if (!likeBtn) return;
        const likeCountText = likeBtn.parentElement.querySelector('span');
        if (likeCountText) likeCountText.innerText = likesCount;
    } catch (err) {
        console.log('Error updating live like:', err);
    }
});



fileInput.addEventListener('change', handleImagePreview);
createForm.addEventListener('submit', (e) => e.preventDefault());
submitPostBtn.addEventListener('click', submitPostData)
document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener('DOMContentLoaded', async () => {
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
            window.location.href = 'Login.html'
        }
        await notify()
        await loadSentMessageCount();
    });
    await renderAccountPosts()

})

