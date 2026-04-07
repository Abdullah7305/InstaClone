const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notifyType: {
        type: String,
        required: true,
        enum: ['Follow_Request', 'Like', 'Comment', 'Post']
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;