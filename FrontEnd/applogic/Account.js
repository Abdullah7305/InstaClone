const editProfileBtn = document.getElementById('editProfileBtn');
const editModal = document.getElementById('edit-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const cancelProfileBtn = document.getElementById('cancel-profile-btn');
const emptyPostArea = document.getElementById('empty-posts');

const followerBtn = document.getElementById('follower-btn');
const followingBtn = document.getElementById('following-btn');
let followDataArr = null;


const profileImg = document.getElementById('profile-img');
const userBio = document.getElementById('userBio');


const modalPreviewImg = document.getElementById('modal-preview-img');
const fileUpload = document.getElementById('file-upload');
const bioInput = document.getElementById('bio-input');

// Track the card currently in edit mode and its original HTML
let currentEditingCard = null;
let currentOriginalContent = '';



// ---------UTILITY FUNCTIONS ARE HERE -----------------------

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

function editProfilePicLocalStorage(imageUrl, bio) {
    imageUrl = filterImageAddress(imageUrl);
    const user = getUserFromLocalStorage();
    user.bio = bio;
    user.profilePicPathUrl = imageUrl;
    localStorage.setItem('user', JSON.stringify(user));
    location.reload();
    return;
}

// -------------EDIT AND DELETE FUNCNTIONALITY----------------

async function handleDelete(card, e) {
    e.preventDefault()
    const postId = e.target.id;
    try {
        const response = await fetch(`http://localhost:8000/post/delete`, {
            method: 'DELETE',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`,
                "content-type": "application/json"
            },
            body: JSON.stringify({ postId })
        })
        const result = await response.json();
        if (response.ok) {
            card.classList.add('fade-out');
            setTimeout(() => {
                card.remove();
            }, 300);
        }
        console.log("Pose Delete Message: ", result)
    } catch (error) {
        console.log("Error while deleting the post is ", error.message)
    }
}


async function submitEditPost(postId, formData) {

    try {
        const response = await fetch(`http://localhost:8000/post/edit/${postId}`, {
            method: 'PUT',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update post");
        }

        return await response.json();
    } catch (err) {
        console.error("API Error (submitEditPost):", err);
        alert("Update failed: " + err.message);
        return null;
    }
}


function renderEditForm(card, postData) {
    // 2. CHECK: If another card is already being edited, revert it first
    if (currentEditingCard && currentEditingCard !== card) {
        currentEditingCard.innerHTML = currentOriginalContent;
    }

    // 3. TRACK: Save the current card and its original HTML before changing it
    currentEditingCard = card;
    currentOriginalContent = card.innerHTML;

    card.innerHTML = '';

    const editForm = document.createElement('form');
    editForm.className = 'p-6 flex flex-col gap-5';

    // --- UI Sections (Same as your original code) ---
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'w-full aspect-[4/3] rounded-xl overflow-hidden bg-black relative border border-[#333]';
    imgWrapper.innerHTML = `
        <img src="http://localhost:8000/uploads/${postData.imageUrl}" id="edit-preview" class="w-full h-full object-cover opacity-60">
        <label class="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-all">
            <span class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/20">Change Photo</span>
            <input type="file" id="edit-file-input" class="hidden" accept="image/*">
        </label>
    `;

    const inputSection = document.createElement('div');
    inputSection.className = 'flex flex-col gap-4';
    inputSection.innerHTML = `
        <input type="text" id="edit-title" value="${postData.title}" 
               class="bg-[#1a1a1a] border border-[#333] p-3 rounded-lg text-white text-lg font-bold focus:border-blue-500 outline-none">
        <textarea id="edit-desc" rows="3" 
                  class="bg-[#1a1a1a] border border-[#333] p-3 rounded-lg text-gray-300 text-sm resize-none focus:border-blue-500 outline-none">${postData.description}</textarea>
    `;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'flex gap-3';
    btnGroup.innerHTML = `
        <button type="submit" class="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all">Update Post</button>
        <button type="button" id="cancel-edit" class="px-6 py-3 text-gray-400 hover:text-white transition-all">Cancel</button>
    `;

    editForm.appendChild(imgWrapper);
    editForm.appendChild(inputSection);
    editForm.appendChild(btnGroup);
    card.appendChild(editForm);

    // --- Logic ---

    // Instant Image Preview
    const fileInput = editForm.querySelector('#edit-file-input');
    fileInput.onchange = (e) => {
        const [file] = e.target.files;
        if (file) {
            editForm.querySelector('#edit-preview').src = URL.createObjectURL(file);
            editForm.querySelector('#edit-preview').style.opacity = '1';
        }
    };

    // 4. Handle Cancel (Revert and reset tracker)
    editForm.querySelector('#cancel-edit').onclick = () => {
        card.innerHTML = currentOriginalContent;
        currentEditingCard = null;
        currentOriginalContent = '';
    };

    // Handle Submit
    editForm.onsubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', document.getElementById('edit-title').value);
        formData.append('description', document.getElementById('edit-desc').value);

        if (fileInput.files[0]) {
            formData.append('image', fileInput.files[0]);
        }

        const success = await submitEditPost(postData._id, formData);

        if (success) {
            // 5. Clean up trackers before reload
            currentEditingCard = null;
            currentOriginalContent = '';
            alert("Updated successfully!");
            location.reload();
        }
    };
}

// ---------LIKE FUNCTION ----------------  

function likePostEvent(e) {
    e.currentTarget;
    console.log("Post Like => ", e.currentTarget.id)
}


// -------------THIS HELP TO LOAD THE FOLLOW AND FOLLOWING DATA---------------

async function getFollowers() {
    try {
        const response = await fetch(`http://localhost:8000/request/followers/${userId}`, {
            method: 'GET',
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        const result = await response.json();
        console.log("Result for followers is ", result)
    } catch (error) {
        console.log("Error in getting the detailed follow data ", error.message)
    }
}

function renderFollowData(data, type) {
    const modal = document.getElementById('follow-modal');
    const container = document.getElementById('follow-modal-content');
    const title = document.getElementById('follow-modal-title');

    // Set the title (Followers or Following)
    title.textContent = type.charAt(0).toUpperCase() + type.slice(1);

    // Clear previous content
    container.innerHTML = '';

    // Show the modal
    modal.classList.remove('hidden');
    modal.classList.add('grid');

    // 1. Handle Empty State
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 text-gray-500">
                <p class="text-sm">No ${type.toLowerCase()} found.</p>
            </div>
        `;
        return;
    }

    const actionText = (type.trim().toLowerCase() === 'following') ? 'Unfollow' : 'Follow Back';

    // 2. Render the List
    const listWrapper = document.createElement('div');
    listWrapper.className = 'flex flex-col w-full gap-2';

    data.forEach(user => {
        const userRow = document.createElement('div');
        userRow.className = 'flex items-center justify-between p-2 rounded-xl hover:bg-neutral-900 transition-colors';

        userRow.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${user.avatar || 'https://i.pravatar.cc/150?img=5'}" 
                     class="w-10 h-10 rounded-full object-cover border border-neutral-800" />
                <div class="flex flex-col text-left">
                    <span class="font-bold text-white text-xs">${user.username}</span>
                    <span class="text-[10px] text-gray-500">User Profile</span>
                </div>
            </div>
            <button class="px-3 py-1 rounded-lg text-[10px] font-semibold border border-neutral-700 hover:bg-white hover:text-black transition-all">
                ${actionText}
            </button>
        `;
        listWrapper.appendChild(userRow);
    });

    container.appendChild(listWrapper);

    // Refresh icons if any were added
    if (window.lucide) lucide.createIcons();
}

async function getFollowData() {
    try {
        const user = getUserFromLocalStorage();
        const username = document.getElementById('username-profile');
        const follow = document.getElementById('followersNum');
        const following = document.getElementById('followingNum');
        const userBio = document.getElementById('userBio');
        const userImage = document.getElementById('profile-img');
        const imageUrl = filterImageAddress(user.profilePicPathUrl);

        const response = await fetch(`http://localhost:8000/request/follow/${user._id}`, {
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        const result = await response.json();

        username.textContent = user.username;
        console.log("Image url is ", imageUrl)
        if (!imageUrl || imageUrl == undefined) {
            userImage.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCF88SudZwAw_SCSvtsW_ReFZljFrACF38qQ&s"
        }
        else {

            userImage.src = `http://localhost:8000/uploads/${imageUrl}`
        }
        console.log("=========>>", result.followNfollowing)
        if (result.followNfollowing) {
            followDataArr = result.followNfollowing;


        }
        else {
            follow.textContent = '0';
            following.textContent = '0'
        }
        userBio.textContent = user.bio;


    } catch (error) {
        console.log("Error in getting Follow Data ", error)
    }
}

async function getAccountPost() {
    try {
        const user = getUserFromLocalStorage();
        const response = await fetch(`http://localhost:8000/post/${user._id}`, {
            headers: {
                "authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        const result = await response.json();
        return result.posts;

    } catch (error) {
        console.log("Error in loading the account post is ", error)
    }
}

function createPostCard(postData) {
    const user = getUserFromLocalStorage();
    let profilePicAddress = filterImageAddress(user.profilePicPathUrl);
    const fallbackImage = 'https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80';

    const card = document.createElement('article');
    card.className = 'flex flex-col mb-12 rounded-2xl overflow-hidden w-full';
    card.style.cssText = 'background: var(--card); border: 1px solid var(--border); box-shadow: 0 8px 20px rgba(0,0,0,0.3); max-width: 450px; margin-inline: auto;';

    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between p-4 border-b border-[#2e2e2e]';

    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center gap-4';
    userInfo.innerHTML = `
        <img src="http://localhost:8000/uploads/${profilePicAddress}" 
             onerror="this.src='${fallbackImage}'"
             class="w-12 h-12 rounded-full object-cover border border-[#3e3e3e]" />
        <div class="flex flex-col">
            <span class="font-bold text-base text-white">${postData.username || 'Muhammad'}</span>
            <span class="text-xs text-gray-400">Lahore, Pakistan</span>
        </div>
    `;

    const menuContainer = document.createElement('div');
    menuContainer.className = 'relative';

    const toggleMenuBtn = document.createElement('button');
    toggleMenuBtn.className = 'text-gray-400 hover:text-white cursor-pointer p-2 rounded-full hover:bg-neutral-800 transition-all';
    toggleMenuBtn.style.background = 'transparent';
    toggleMenuBtn.style.border = 'none';
    // FIXED SVG: Removed spaces from tags and attributes
    toggleMenuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
        </svg>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'flex flex-col rounded-xl overflow-hidden z-50 shadow-2xl hidden';
    dropdown.style.cssText = 'position: absolute; top: 100%; right: 0; margin-top: 12px; min-width: 180px; background: #1a1a1a; border: 1px solid #333;';

    const editBtn = document.createElement('button');
    editBtn.innerHTML = 'Edit Post';
    editBtn.className = 'text-left text-sm font-medium text-white px-6 py-4 hover:bg-neutral-800 transition-colors cursor-pointer border-b border-[#333]';
    editBtn.style.background = 'transparent';
    editBtn.style.border = 'none';
    editBtn.onclick = (e) => { e.stopPropagation(); renderEditForm(card, postData); };

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = 'Delete Post';
    deleteBtn.className = 'text-left text-sm font-medium px-6 py-4 hover:bg-neutral-800 transition-colors cursor-pointer text-red-500';
    deleteBtn.style.background = 'transparent';
    deleteBtn.style.border = 'none';
    deleteBtn.onclick = (e) => { handleDelete(card, e); };

    dropdown.append(editBtn, deleteBtn);
    menuContainer.append(toggleMenuBtn, dropdown);
    header.append(userInfo, menuContainer);

    // Image
    const imgWrap = document.createElement('div');
    imgWrap.className = 'w-full aspect-[4/3] bg-black overflow-hidden';
    const image = document.createElement('img');
    image.src = `http://localhost:8000/uploads/${postData.imageUrl}`;
    image.className = 'w-full h-full object-cover';
    image.onerror = () => image.src = fallbackImage;
    imgWrap.appendChild(image);

    // Footer & Comments
    const footer = document.createElement('div');
    footer.className = 'p-5 flex flex-col gap-4';

    const likeSection = document.createElement('div');
    likeSection.className = 'flex items-center gap-2 w-fit';
    const likeBtn = document.createElement('button');
    likeBtn.className = 'text-white hover:text-pink-500 transition-all cursor-pointer hover:scale-110';
    likeBtn.style.cssText = 'background:transparent; border:none; padding:0;';
    likeBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

    const likeCountText = document.createElement('span');
    likeCountText.className = 'text-gray-400 text-sm font-medium';
    likeCountText.innerText = postData.likesCount || 0;
    likeSection.append(likeBtn, likeCountText);

    const textContent = document.createElement('div');
    textContent.innerHTML = `
        <div class="font-bold text-lg text-white mb-1">${postData.title}</div>
        <p class="text-gray-400 text-sm leading-relaxed">${postData.description}</p>`;

    // Comment Area
    const commentSection = document.createElement('div');
    commentSection.className = 'mt-2 flex flex-col gap-3 border-t border-[#2e2e2e] pt-4';

    const commentList = document.createElement('div');
    commentList.className = 'max-h-40 overflow-y-auto flex flex-col gap-2 pr-2';
    commentList.style.scrollbarWidth = 'thin';

    const inputRow = document.createElement('div');
    inputRow.className = 'flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-2 border border-[#333]';
    inputRow.innerHTML = `
        <input type="text" placeholder="Comment..." class="bg-transparent border-none outline-none text-xs text-white flex-1">
        <button class="text-pink-500 cursor-pointer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>`;

    const input = inputRow.querySelector('input');
    const sendBtn = inputRow.querySelector('button');

    const addComment = (val, isReply = false) => {
        const div = document.createElement('div');
        div.className = `flex flex-col gap-1 ${isReply ? 'ml-6 border-l-2 border-[#333] pl-2' : ''}`;
        div.innerHTML = `
            <div class="text-xs text-gray-300 bg-[#262626] p-2 rounded">
                <span class="font-bold text-white mr-1">${user?.username || 'User'}</span> ${val}
                <div class="flex gap-3 mt-1 opacity-60 text-[10px] font-bold uppercase cursor-pointer">
                    <span onclick="this.classList.toggle('text-pink-500')">Like</span>
                    <span onclick="document.querySelector('#input-${postData._id}').value='@${user?.username} '; document.querySelector('#input-${postData._id}').focus()">Reply</span>
                </div>
            </div>`;
        commentList.appendChild(div);
        commentList.scrollTop = commentList.scrollHeight;
    };

    input.id = `input-${postData._id}`;
    sendBtn.onclick = () => { if (input.value.trim()) { addComment(input.value, input.value.startsWith('@')); input.value = ''; } };

    footer.append(likeSection, textContent, commentSection);
    commentSection.append(commentList, inputRow);
    card.append(header, imgWrap, footer);

    // Events
    toggleMenuBtn.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); };
    likeBtn.onclick = (e) => likePostEvent(e, likeCountText);

    return { card, likeBtn, editBtn, deleteBtn };
}

async function renderAccountPosts() {
    const posts = await getAccountPost();
    const postArea = document.getElementById('post-area');
    postArea.innerHTML = '';

    if (posts) {
        emptyPostArea.innerHTML = '';
        posts.forEach(post => {
            // Destructure the object to get the 'card' element
            const { card, likeBtn, editBtn, deleteBtn } = createPostCard(post);

            // FIX: Append ONLY the card node
            postArea.appendChild(card);


        });
    }

    console.log("Result For post is ", posts);
}

// -----------------EDITING THE FORM HERE---------

async function updateProfileStatus(formData, event) {
    event.preventDefault();
    const user = getUserFromLocalStorage();
    try {
        const response = await fetch(`http://localhost:8000/user/profile/${user._id}`, {
            method: 'PUT',
            headers: {

                "authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        const result = await response.json();
        console.log("Result for profile update is ", result);
        return result;
    } catch (error) {
        console.log("Error while updating the profile picture is ", error)
    }
}

function editProfile(e) {
    modalPreviewImg.src = profileImg.src || '';
    bioInput.value = userBio.innerText;
    toggleModal(e);
}

function toggleModal(event) {
    event.preventDefault()
    editModal.classList.toggle('hidden');
    editModal.classList.toggle('flex');
    lucide.createIcons();
}

function editModelHandler(e) {

    if (e.target === editModal) {
        toggleModal(e);
    }

}

function fileUploadHandler(e) {

    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            modalPreviewImg.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }

}

async function saveProfileHandler(event) {
    //send api request 
    //recive the response 
    //show the src through this one
    event.preventDefault();
    const updatedBio = bioInput.value;
    const updatedProfilePic = fileUpload.files[0];
    const formData = new FormData();
    const user = getUserFromLocalStorage();
    formData.append('bio', updatedBio);
    formData.append('userId', user._id);
    if (updatedProfilePic) {
        formData.append('image', updatedProfilePic)
    }
    const result = await updateProfileStatus(formData, event);
    editProfilePicLocalStorage(result.profilePicPath, result.bio)
    console.log("Result is ", result);
    toggleModal(event);
}

editProfileBtn.addEventListener('click', editProfile);


cancelProfileBtn.addEventListener('click', toggleModal)


closeModalBtn.addEventListener('click', toggleModal);


editModal.addEventListener('click', editModelHandler);


fileUpload.addEventListener('change', fileUploadHandler);

followerBtn.addEventListener('click', () => {
    renderFollowData(followDataArr.followers, "follow")
})
followingBtn.addEventListener('click', () => {
    renderFollowData(followDataArr.following, "following")
})

saveProfileBtn.addEventListener('click', async (event) => {
    event.preventDefault()
    await saveProfileHandler(event)
});


document.addEventListener('DOMContentLoaded', async () => {
    await getFollowData();
    await renderAccountPosts();
});
