const mongoose = require('mongoose');

const PostCommentSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    commentText: {
        type: String,
        required: true
    },
    commentLikeCount: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

});

const PostComments = mongoose.model('PostComments', PostCommentSchema);

module.exports = PostComments;