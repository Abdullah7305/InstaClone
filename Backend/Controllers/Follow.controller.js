const UserFollow = require('../Models/Follow.model');
const User = require('../Models/User.model');
const FollowRequest = require('../Models/FollowRequest.model')
const Notification = require('../Models/Notification.model');
const socketManager = require('../socket');
const onlineUsers = require('../onlineUsers');
const mongoose = require('mongoose');

const sendFollowData = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId == undefined) {
            return res.status(400).json({ message: 'No User Found' });
        }
        const followNfollowing = await UserFollow.findOne({ userId: userId }, { userId: 0, _id: 0 });
        console.log(followNfollowing);
        return res.status(200).json({ message: 'Success', followNfollowing: followNfollowing });
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error });
    }
}

const followRequest = async (req, res) => {
    try {
        const follower = req.body.userId;
        const following = req.params.userId;

        // Fetch the following user's account status
        const followingProfile = await User.findOne({ _id: new mongoose.Types.ObjectId(following) }, { _id: 0, accountStatus: 1 });
        if (!followingProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check existing request status
        const existingRequest = await FollowRequest.findOne({
            follower: follower,
            following: following
        });

        let requestStatus = existingRequest ? existingRequest.requestStatus : null;

        // If already following (accepted), allow unfollowing
        if (requestStatus === 'Accepted') {
            // Unfollow logic: remove from Follow collections and update request to 'Rejected' or delete
            let userFollowing = await UserFollow.findOne({ userId: follower });
            if (userFollowing) {
                userFollowing.following = userFollowing.following.filter(id => id.toString() !== following);
                await userFollowing.save();
            }
            let userFollowers = await UserFollow.findOne({ userId: following });
            if (userFollowers) {
                userFollowers.followers = userFollowers.followers.filter(id => id.toString() !== follower);
                await userFollowers.save();
            }
            await FollowRequest.findOneAndUpdate(
                { follower: follower, following: following },
                { $set: { requestStatus: 'Rejected' } }
            );
            return res.status(201).json({ message: 'Unfollowed' });
        }

        // If public account, directly follow (no request needed)
        if (followingProfile.accountStatus === 'public') {
            // Create or update request to 'Accepted'
            await FollowRequest.findOneAndUpdate(
                { follower: follower, following: following },
                { $set: { requestStatus: 'Accepted' } },
                { upsert: true, new: true }
            );

            // Update Follow collections
            await UserFollow.findOneAndUpdate(
                { userId: follower },
                { $addToSet: { following: following } },
                { upsert: true, new: true }
            );
            await UserFollow.findOneAndUpdate(
                { userId: following },
                { $addToSet: { followers: follower } },
                { upsert: true, new: true }
            );

            // Send follow notification (not request)
            await Notification.create({
                sender: follower,
                receiver: following,
                notifyType: 'Follow'  // Assuming you have a 'Follow' type for direct follows
            });

            // Emit socket event for direct follow
            const targetSocketId = onlineUsers[following];
            if (targetSocketId) {
                const io = socketManager.getIO();
                const senderName = await User.findOne({ _id: follower }, { username: 1 });
                io.to(targetSocketId).emit('direct-follow', {
                    senderName: senderName.username,
                    notifyType: 'Follow'
                });
            }

            return res.status(200).json({ message: 'Successfully followed the user' });
        }

        // For private accounts, handle request logic
        if (requestStatus === 'Requested') {
            // Cancel request
            await FollowRequest.findOneAndUpdate(
                { follower: follower, following: following },
                { $set: { requestStatus: 'Rejected' } }
            );
            await Notification.deleteOne({
                sender: follower,
                receiver: following,
                notifyType: 'Follow_Request'
            });
            return res.status(201).json({ message: 'Request cancelled' });
        } else if (requestStatus === 'Rejected' || !existingRequest) {
            // Send new request
            await FollowRequest.findOneAndUpdate(
                { follower: follower, following: following },
                { $set: { requestStatus: 'Requested' } },
                { upsert: true, new: true }
            );
            await Notification.create({
                sender: follower,
                receiver: following,
                notifyType: 'Follow_Request'
            });

            // Emit socket event
            const targetSocketId = onlineUsers[following];
            if (targetSocketId) {
                const io = socketManager.getIO();
                const senderName = await User.findOne({ _id: follower }, { username: 1 });
                io.to(targetSocketId).emit('follow-request', {
                    senderName: senderName.username,
                    notifyType: 'Follow_Request'
                });
            }

            return res.status(200).json({ message: 'Request sent' });
        }

    } catch (error) {
        console.log("Error in sending follow request", error.message);
        return res.status(500).json({ message: `Failed ${error.message}` });
    }
};

const acceptRequest = async (req, res) => {
    try {
        const { sender, receiver } = req.body;
        console.log("Senrder and receiver are", sender, receiver);
        if (!sender || !receiver) {
            return res.status(200).json({ message: 'No Data Sent Properly' })
        }
        // Update request status and remove notification, and update both users' follow docs
        await Promise.all([
            FollowRequest.findOneAndUpdate(
                { follower: sender, following: receiver },
                { $set: { requestStatus: 'Accepted' } }
            ),
            Notification.deleteOne({ sender: sender, receiver: receiver, notifyType: 'Follow_Request' }),
            Notification.create({ sender: receiver, receiver: sender, notifyType: 'Accept_Request' })
        ]);

        // Add receiver to sender's `following` list (create doc if missing)
        const addFollowing = UserFollow.findOneAndUpdate(
            { userId: sender },
            { $addToSet: { following: receiver } },
            { upsert: true, new: true }
        );

        // Add sender to receiver's `followers` list (create doc if missing)
        const addFollower = UserFollow.findOneAndUpdate(
            { userId: receiver },
            { $addToSet: { followers: sender } },
            { upsert: true, new: true }
        );

        await Promise.all([addFollowing, addFollower]);


        const senderSocketId = onlineUsers[sender];
        console.log("Sender id is ", senderSocketId);
        if (senderSocketId) {
            const receiverName = await Notification({ receiver: receiver }, { sender: 0, _id: 0 }).populate('receiver', 'username')
            console.log("Receiver name is ", receiverName.receiver.username);
            const io = socketManager.getIO();
            io.to(senderSocketId).emit('accept-request', {
                receiverName: receiverName.receiver.username

            })
        }

        return res.status(201).json({ message: 'Request Accepted' });
    } catch (error) {
        console.log("Error in accepting request ", error)
        return res.status(500).json({ message: 'Failed ', error: error.message })
    }
}

const rejectRequest = async (req, res) => {
    try {
        const { sender, receiver } = req.body;
        if (!sender || !receiver) {
            return res.status(200).json({ message: 'No Data Sent Properly' })
        }
        Promise.all([
            await FollowRequest.findOneAndUpdate(
                {
                    follower: sender,
                    following: receiver,

                },
                {
                    $set: {
                        requestStatus: 'Rejected'
                    }
                }
            ),
            await Notification.deleteOne({
                sender: sender,
                receiver: receiver,
                notifyType: 'Follow_Request'
            })
        ])

        return res.status(201).json({ message: 'User deleted Successfully..' })
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

module.exports = { sendFollowData, followRequest, acceptRequest, rejectRequest };

