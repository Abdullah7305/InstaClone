const mongoose = require('mongoose');

const FollowRequestSchema = mongoose.Schema({
    follower: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    following: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestStatus: {
        type: String,
        default: 'Follow',
        enum: ["Requested", "Accepted", "Rejected"]
    }
})

const FollowRequest = mongoose.model('FollowRequest', FollowRequestSchema);

module.exports = FollowRequest;