const mongoose = require('mongoose');
const PostSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String,
        required: true
    },


}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;