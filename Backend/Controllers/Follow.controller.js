const UserFollow = require('../Models/Follow.model');
const FollowRequest = require('../Models/FollowRequest.model')
const Notification = require('../Models/Notification.model');

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
            return res.status(200).json({ message: 'Requested' });
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
        Promise.all([
            await FollowRequest.findOneAndUpdate(
                {
                    follower: sender,
                    following: receiver,

                },
                {
                    $set: {
                        requestStatus: 'Accepted'
                    }
                }
            ),
            await Notification.deleteOne({
                sender: sender,
                receiver: receiver,
                notifyType: 'Follow_Request'
            })
        ])
        const addFollowing = await Follow.findOneAndUpdate(
            { userId: sender },
            {
                $addToSet: { following: receiver }
            },
            { upsert: true, new: true }
        )
        return res.status(201).json({ message: 'Request Accepted' })
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

