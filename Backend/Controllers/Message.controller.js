const Message = require('../Models/Message.model');

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



module.exports = { createMessage };