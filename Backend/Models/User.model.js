const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    profilePicPathUrl: {
        type: String,
    },
    bio: {
        type: String
    },
    accountStatus: {
        type: String,
        default: 'public'
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;