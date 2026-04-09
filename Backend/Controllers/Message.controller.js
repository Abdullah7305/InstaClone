const Message = require('../Models/Message.model');
const Follow = require('../Models/Follow.model');

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
        console.log("all ids are ", senderId, receiverId);
        return res.status(200).json({ message: 'Success', messages: '' })
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

module.exports = { createMessage, userChatList,loadDirectMessages };