const mongoose = require('mongoose');
const PostLikeSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    likesCounts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ]

});

const PostLike = mongoose.model('PostLike', PostLikeSchema);

module.exports = PostLike;