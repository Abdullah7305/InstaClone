const Message = require('../Models/Message.model');
const Follow = require('../Models/Follow.model');
const Notification = require('../Models/Notification.model');
const onlineUser = require('../onlineUsers');
const socketManager = require('../socket');


const createMessage = async (req, res) => {
    try {
        const { mesgText, senderId, receiverId } = req.body;

        if (!mesgText || !senderId || !receiverId) {
            return res.status(400).json({ message: 'Failed..' });

        }

        const saveMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            text: mesgText
        })
        const mesgNotification = await Notification.create({
            sender: senderId,
            receiver: receiverId,
            notifyType: 'Message'
        })
        //sende message through socket 
        if (saveMessage && mesgNotification) {
            const io = socketManager.getIO();
            const targetSocket = onlineUser[receiverId];
            console.log("targetSocket", targetSocket);
            io.to(targetSocket).emit('send-message', {
                sender: senderId,
                receiver: receiverId,
                text: mesgText
            })

        }



        return res.status(200).json({ message: 'Successfully sent message', message: saveMessage });
    } catch (error) {
        return res.status(500).json({ message: 'Failed messages', error: error })
    }
}

const userChatList = async (req, res) => {
    try {
        const { userId } = req.query;
        const following = await Follow.findOne({ userId: userId }).populate('following', 'username profilePicPathUrl')
        console.log("Following ", following.following);
        if (following.following.length > 0) {

            return res.status(200).json({ message: 'Success', following: following.following })
        }
        return res.status(200).json({ message: 'No Chat List Exist', following: [] });
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

const loadDirectMessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.query;
        let messages = await Message.find({ $or: [{ sender: receiverId, receiver: senderId }, { sender: senderId, receiver: receiverId }] }).sort({ _id: 1 })
        let userMessages = [...messages]
        await Notification.deleteMany({ sender: senderId, receiver: receiverId });
        userMessages.length > 0 ? userMessages : [];


        return res.status(200).json({ message: 'Success', userMessages: userMessages })
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}



module.exports = { createMessage, userChatList, loadDirectMessages };