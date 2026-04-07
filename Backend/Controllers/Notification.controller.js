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
        const userNotification = await Notification.find({ receiver: userId }, { _id: 0, receiver: 0 }).populate('sender', 'username');
        if (userNotification.length > 0) {
            return res.status(200).json({ message: true, notification: userNotification });
        }
        return res.status(200).json({ message: 'Not Notification Exist' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message });
    }
}