const Likes = require('../Models/Like.model');
const Post = require('../Models/Post.model');
const socketManager = require('../socket');
const onlineUsers = require('../onlineUsers');
const User = require('../Models/User.model');
const Notification = require('../Models/Notification.model');
const mongoose = require('mongoose');

const savePostLike = async (req, res) => {
    try {
        const { postId, userId } = req.body;

        const likeExist = await Likes.findOne({ postId: postId });
        console.log("Like Exists ===>>", likeExist);

        if (likeExist == null) {//using socket here
            const postUser = await Post.findOne({ _id: new mongoose.Types.ObjectId(postId) }).populate('userId', 'username');
            const postLikedBy = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { _id: 0, username: 1 });

            const io = socketManager.getIO();
            const targetSocket = onlineUsers[postUser.userId._id];
            const postLike = await Likes.create({
                postId: postId,
                likesCounts: [userId]
            })
            // create notification and targeted socket emit only if liker is NOT the post owner
            const isOwner = postUser.userId._id.toString() === userId.toString();
            console.log("Data for notifications is ", userId, postUser.userId._id, "isOwner:", isOwner);
            if (!isOwner) {
                await Notification.create({ sender: userId, receiver: postUser.userId._id, notifyType: 'Like' });
                if (targetSocket) {
                    io.to(targetSocket).emit('like-post', { username: postLikedBy.username });
                }
            }
            // Broadcast live like update to all connected clients so feeds update in real-time
            const actorSocket = onlineUsers[userId];
            const payload = {
                postId: postId,
                likesCount: postLike.likesCounts.length,
                username: postLikedBy.username
            };
            if (actorSocket) {
                if (typeof io.except === 'function') {
                    io.except(actorSocket).emit('post-liked', payload);
                } else if (io.sockets && io.sockets.sockets && typeof io.sockets.sockets.forEach === 'function') {
                    io.sockets.sockets.forEach((s) => { if (s.id !== actorSocket) s.emit('post-liked', payload); });
                } else {
                    io.emit('post-liked', payload);
                }
            } else {
                io.emit('post-liked', payload);
            }
            return res.status(201).json({ message: 'Success' });
        }

        let userLikeExist = likeExist.likesCounts.includes(userId);
        if (userLikeExist) {
            likeExist.likesCounts = likeExist.likesCounts.filter(likeId => likeId != userId)
            await likeExist.save()
            return res.status(200).json({ message: 'User Dislike the Post' });
        }
        else {//user socket here
            const postUser = await Post.findOne({ _id: new mongoose.Types.ObjectId(postId) }).populate('userId', 'username');
            const postLikedBy = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { _id: 0, username: 1 });

            const io = socketManager.getIO();
            const targetSocket = onlineUsers[postUser.userId._id];

            likeExist.likesCounts.push(userId);
            await likeExist.save()
            const isOwner = postUser.userId._id.toString() === userId.toString();
            console.log("Data for notifications is ", userId, postUser.userId._id, "isOwner:", isOwner);
            if (!isOwner) {
                await Notification.create({ sender: userId, receiver: postUser.userId._id, notifyType: 'Like' });
                if (targetSocket) {
                    io.to(targetSocket).emit('like-post', { username: postLikedBy.username });
                }
            }

            console.log("Like Saved", likeExist)
            // Broadcast live like update to all connected clients so feeds update in real-time
            const actorSocket = onlineUsers[userId];
            const payload = {
                postId: postId,
                likesCount: likeExist.likesCounts.length,
                username: postLikedBy.username
            };
            if (actorSocket) {
                if (typeof io.except === 'function') {
                    io.except(actorSocket).emit('post-liked', payload);
                } else if (io.sockets && io.sockets.sockets && typeof io.sockets.sockets.forEach === 'function') {
                    io.sockets.sockets.forEach((s) => { if (s.id !== actorSocket) s.emit('post-liked', payload); });
                } else {
                    io.emit('post-liked', payload);
                }
            } else {
                io.emit('post-liked', payload);
            }
            return res.status(200).json({ message: 'User like the Post ' });
        }



    } catch (error) {
        console.log("Error in liking the post is ", error.message)
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

const sendPostLikes = async (req, res) => {
    try {
        const { userid } = req.query;


        const likes = await Likes.find({ userId: userid });

        if (likes.length > 0) {
            return res.status(200).json({ message: 'Success', likes: likes })
        }
        return res.status(200).json({ message: 'Failed No likes' })

    } catch (error) {
        console.log("Error in sending  likes is ", error.message)
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

module.exports = { savePostLike, sendPostLikes };