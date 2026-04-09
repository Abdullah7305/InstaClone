const Notification = require('../Models/Notification.model');
const { ObejctId, default: mongoose } = require('mongoose');

exports.sendNotification = async (req, res) => {
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

exports.sendDetailedNotifications = async (req, res) => {
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

exports.deleteNotifcation = async (req, res) => {
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