const fileInput = document.getElementById('create-post-file');
const postTitle = document.getElementById('post-title');
const postDescription = document.getElementById('post-caption');
const previewImg = document.getElementById('create-post-preview');
const placeholder = document.getElementById('placeholder-content');
const createForm = document.getElementById('create-post-form');
const submitPostBtn = document.getElementById("submit-post-btn");
const homeProfilePic = document.getElementById('home-profile-pic');
const homeProfileName = document.getElementById('home-profile-name');

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
async function postComment(postId, commentText) {
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
    header.innerHTML = `<img class="w-10 h-10 rounded-full object-cover border border-[#3e3e3e]" src="${authorPfpPath ? `http://localhost:8000/uploads/${authorPfpPath}` : fallbackImage}" onerror="this.src='${fallbackImage}'"><a href="Account.html" class="font-bold text-sm text-white">${authorUsername}</a>`;

    const imgWrap = document.createElement('div');
    const cleanPostImg = postData.imageUrl ? filterImageAddress(postData.imageUrl) : null;
    imgWrap.className = 'w-full aspect-video bg-black overflow-hidden';
    imgWrap.innerHTML = `<img class="w-full h-full object-cover" src="${cleanPostImg ? `http://localhost:8000/uploads/${cleanPostImg}` : fallbackImage}">`;
    const footer = document.createElement('div');
    footer.className = 'p-4 flex flex-col gap-3';
    footer.innerHTML = `
        <div class="flex items-center gap-2 text-white">
            <button class="hover:text-pink-500 transition-all cursor-pointer bg-transparent border-none p-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <span class="text-gray-400 text-sm font-medium">${postData.likesCount || 0}</span>
        </div>
        <div class="font-bold text-lg text-white">${postData.title}</div>
        <p class="text-gray-400 text-sm line-clamp-2">${postData.description}</p>
    `;

    // Comment Section
    const commentSection = document.createElement('div');
    commentSection.className = 'px-4 pb-4 border-t border-[#2e2e2e] flex flex-col gap-2';

    const commentList = document.createElement('div');
    commentList.className = 'max-h-48 overflow-y-auto py-2 flex flex-col gap-3 custom-scrollbar';
    commentList.style.scrollbarWidth = 'thin';

    const inputRow = document.createElement('div');
    inputRow.className = 'flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-[#333]';
    inputRow.innerHTML = `
        <input type="text" placeholder="Add comment..." class="bg-transparent border-none outline-none text-xs text-white flex-1">
        <button class="text-pink-500 cursor-pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
    `;

    const input = inputRow.querySelector('input');
    const sendBtn = inputRow.querySelector('button');

    const createCommentElement = (text, isReply = false) => {
        const div = document.createElement('div');
        div.className = `flex flex-col gap-1 ${isReply ? 'ml-6 border-l-2 border-[#333] pl-3' : ''}`;
        div.innerHTML = `
            <div class="text-xs text-gray-300 bg-[#262626] p-2 rounded relative">
                <span class="font-bold text-white mr-2">${user?.username || 'Guest'}</span>
                <span>${text}</span>
                <div class="flex gap-3 mt-2 text-[10px] font-semibold uppercase tracking-wider">
                    <button class="like-comment text-gray-500 hover:text-pink-500 transition-colors">Like</button>
                    <button class="reply-comment text-gray-500 hover:text-white transition-colors">Reply</button>
                </div>
            </div>
        `;

        // Like Functionality
        div.querySelector('.like-comment').onclick = (e) => {
            e.target.classList.toggle('text-pink-500');
            e.target.innerText = e.target.innerText === 'LIKE' ? 'LIKED' : 'LIKE';
        };

        // Reply Functionality
        div.querySelector('.reply-comment').onclick = () => {
            input.value = `@${user?.username} `;
            input.focus();
        };

        return div;
    };

    sendBtn.onclick = async () => {
        if (!input.value.trim()) return;
        const isReply = input.value.startsWith('@');
        await postComment(postData._id, input.value.trim());
        commentList.appendChild(createCommentElement(input.value, isReply));
        input.value = '';
        commentList.scrollTop = commentList.scrollHeight;
    };

    commentSection.append(commentList, inputRow);
    card.append(header, imgWrap, footer, commentSection);

    // wire like button behavior and initial like state
    try {
        const likeBtn = footer.querySelector('button');
        const likeCountText = footer.querySelector('span');
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
    homeProfilePic.src = `http://localhost:8000/uploads/${profilePicPathUrl}`
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

// Small toast for accepted follow requests
function showAcceptUI(data) {
    const username = (data && data.sender && data.sender.username) || 'Someone';
    const msg = `${username} accepted your follow request`;

    const toast = document.createElement('div');
    Object.assign(toast.style, {
        position: 'fixed',
        right: '16px',
        top: '16px',
        background: 'rgba(17,17,17,0.95)',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '320px',
        fontSize: '14px'
    });

    const text = document.createElement('span');
    text.textContent = msg;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '18px',
        cursor: 'pointer',
        lineHeight: '1'
    });
    closeBtn.addEventListener('click', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    });

    toast.appendChild(text);
    toast.appendChild(closeBtn);
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
}

socket.on('follow-request', (data) => {
    console.log("SOcket incoming data is ", data);
    const dot = document.getElementById('nav-notif-dot');
    if (dot) dot.classList.remove('hidden');
})

socket.on("accept-request", (data) => {
    console.log("Follow Request Accepted ", data);
    const dot = document.getElementById('nav-notif-dot');
    if (dot) dot.classList.remove('hidden');
    // show a small UI toast to inform the user
    try {
        showAcceptUI(data);
    }
    catch (e) {
        console.log('showAcceptUI error', e);
    }
    // Refresh notification state so the notification box shows updated items
    try {
        if (typeof notify === 'function') notify();
        const notifBox = document.getElementById('notification-box');
        if (notifBox && !notifBox.classList.contains('hidden')) {
            if (typeof getDetailedNotification === 'function') getDetailedNotification();
        }
    } catch (err) {
        console.log('Error refreshing notifications on accept-request', err);
    }
})



fileInput.addEventListener('change', handleImagePreview);
submitPostBtn.addEventListener('click', submitPostData)
document.addEventListener('DOMContentLoaded', async () => {
    await renderAccountPosts()

})

