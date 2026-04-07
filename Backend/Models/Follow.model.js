const mongoose = require('mongoose');
const FollowSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',

        }
    ]

});

const UserFollow = mongoose.model('UserFollow', FollowSchema);

module.exports = UserFollow;