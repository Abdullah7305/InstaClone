const UserFollow = require('../Models/Follow.model');
const FollowRequest = require('../Models/FollowRequest.model')
const Notification = require('../Models/Notification.model');
const socketManager = require('../socket');
const onlineUsers = require('../onlineUsers');

exports.sendFollowData = async (req, res) => {
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

exports.followRequest = async (req, res) => {
    try {
        //use the follow collection change the status to requested
        const follower = req.body.userId;
        const following = req.params.userId;
        let requestSent = false;
        //If follow request Exist
        const isRequested = await FollowRequest.exists(
            {
                follower: follower, following: following,
                requestStatus: 'Requested'
            }
        );
        const isAccepted = await FollowRequest.exists(
            {
                follower: follower, following: following,
                requestStatus: 'Accepted'
            }
        )
        const isRejected = await FollowRequest.exists(
            {
                follower: follower, following: following,
                requestStatus: 'Rejected'
            }
        );
        if (isRequested || isAccepted) {//if user already reuqested and want to cancel the reuest ot to cancelt the following then
            await Promise.all([
                FollowRequest.findOneAndUpdate(
                    { follower: follower, following: following },
                    { $set: { requestStatus: 'Rejected' } }
                ),
                Notification.deleteOne(
                    { sender: follower, receiver: following, notifyType: 'Follow_Request' }
                )
            ])
            return res.status(201).json({ message: `Rejected` })
        }
        else if (isRejected) {//if use want to sned the request again then
            await Promise.all([
                FollowRequest.findOneAndUpdate(
                    { follower: follower, following: following },
                    { $set: { requestStatus: 'Requested' } }
                ),
                Notification.create({
                    sender: follower,
                    receiver: following,
                    notifyType: 'Follow_Request'
                })
            ])
            requestSent = true;

        }
        else {//first time when the user will send the request 
            await Promise.all([
                await FollowRequest.create({
                    follower: follower,
                    following: following,
                    requestStatus: 'Requested'
                }),
                await Notification.create({
                    sender: follower,
                    receiver: following,
                    notifyType: 'Follow_Request'
                })
            ]);
            requestSent = true;

        }
        if (requestSent === true) {
            const targetSocketId = onlineUsers[following];
            const io = socketManager.getIO();
            const senderName = await Notification.findOne({ receiver: following }, { _id: 0, receiver: 0 }).populate('sender', 'username');
            console.log("Sender name is ", senderName.sender.username);
            console.log("Target Id is ", targetSocketId);
            io.to(targetSocketId).emit('follow-request', {
                senderName: senderName.sender.username,
                notifyType: 'Follow_Request'
            })
            return res.status(200).json({ message: 'Requested ' });
        }


    } catch (error) {
        console.log("Error in sending follow request", error.message);
        return res.status(500).json({ message: `Failed ${error}` })
    }
}

exports.acceptRequest = async (req, res) => {
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
            Notification.deleteOne({ sender: sender, receiver: receiver, notifyType: 'Follow_Request' })
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

exports.rejectRequest = async (req, res) => {
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

