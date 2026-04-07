const mongoose = require('mongoose');

const PostCommentSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true
    },
    commentText: {
        type: String,
        required: true,
        trim: true
    },
    commentLikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]

});

const PostComments = mongoose.model('PostComments', PostCommentSchema);

module.exports = PostComments;