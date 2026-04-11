const Notification = require('../Models/Notification.model');
const mongoose = require('mongoose');

const sendNotification = async (req, res) => {
    try {
        const userId = req.params.notifyId;

        const userNotification = await Notification.exists({ receiver: userId });
        if (userNotification) {
            return res.status(200).json({ message: true });
        }
        return res.status(200).json({ message: false });
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

const sendDetailedNotifications = async (req, res) => {
    try {
        const userId = req.params.notifyId;
        const userNotification = await Notification.find({ receiver: userId }, { receiver: 0 }).populate('sender', 'username');
        if (userNotification.length > 0) {
            return res.status(200).json({ message: true, notification: userNotification });
        }
        return res.status(200).json({ message: 'Not Notification Exist' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message });
    }
}

const sentMessageCount = async (req, res) => {
    try {
        const { receiverId } = req.query;
        console.log("Receiver is ", receiverId);
        //retreive the distinct sender from the notifications and then send the array lentgh just
        const messageNotify = await Notification.distinct('sender', { receiver: receiverId });
        return res.status(200).json({ message: 'Success', messageNotify: messageNotify });

    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

const deleteNotifcation = async (req, res) => {
    try {
        const { notificationId } = req.body;
        console.log("Notification id ", notificationId);
        const deleteNotif = await Notification.deleteOne({ _id: new mongoose.Types.ObjectId(notificationId) });
        if (deleteNotif) {

            return res.status(201).json({ message: 'Delte the notification successfully' })
        }
        return res.status(400).json({ message: 'Cannot Delete Notification' })
    } catch (error) {
        console.log("Error on deleting message is ", error)
        return res.status(500).json({ message: 'Failed', error: error })
    }
}

module.exports = { sendNotification, sendDetailedNotifications, sentMessageCount, deleteNotifcation };