const Comment = require('../Models/Comment.model');
const Post = require('../Models/Post.model');
const User = require('../Models/User.model');
const socketManager = require('../socket');
const onlineUsers = require('../onlineUsers');
const Notification = require('../Models/Notification.model');
const mongoose = require('mongoose');

const createComment = async (req, res) => {
    try {
        const { postId, commentText } = req.body;
        const { userId } = req.params; // The user who is commenting

        // 1. Fetch the user who is commenting (to get their username)
        const postCommentBy = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { _id: 0, username: 1 });

        // 2. Fetch the Post and populate the author (to know who to notify)
        const postUser = await Post.findOne({ _id: new mongoose.Types.ObjectId(postId) }).populate('userId', 'username');

        // 3. Create the comment in the database
        const createdComment = await Comment.create({
            userId: userId,
            postId: postId,
            commentText: commentText,
            commentLikes: []
        });

        // 4. Save Notification to Database
        await Notification.create({
            sender: userId,
            receiver: postUser.userId._id,
            notifyType: 'Comment'
        });

        // 5. Socket.io Real-time Notification
        const io = socketManager.getIO();
        const targetSocket = onlineUsers[postUser.userId._id];

        if (targetSocket) {
            io.to(targetSocket).emit('post-comment', {
                username: postCommentBy.username,
                commentText: commentText, // Optional: send the text snippet
                postId: postId
            });
        }

        console.log("Comment Created and Socket Emitted", createdComment);
        return res.status(200).json({ message: 'Success', data: createdComment });

    } catch (error) {
        console.error("Error in createComment:", error);
        return res.status(500).json({ message: 'Failed', error: error.message });
    }
};

const loadComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ postId: postId }).populate('userId', 'username');
        return res.status(200).json({ message: 'Success', data: comments });
    } catch (error) {
        console.error("Error in loadComments:", error);
        return res.status(500).json({ message: 'Failed', error: error.message });
    }
};

module.exports = { createComment, loadComments };


