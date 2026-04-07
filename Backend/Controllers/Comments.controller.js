const Comment = require('../Models/Comment.model');
const Post = require('../Models/Post.model')

exports.createComment = async (req, res) => {
    try {
        const { postId, commentText } = req.body;
        const { userId } = req.params;
        console.log("Comment data is ", postId, userId, commentText);
        const createComment = await Comment.create({
            userId: userId,
            postId: postId,
            commentText: commentText,
            commentLikes: []
        })
        console.log("Comment Created ", createComment);
        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        return res.statu(200).json({ message: 'Failed', error: error.message });
    }
}

exports.likeComment = async (req, res) => {
    try {
        const { userId } = req.params;
        const { commentId } = req.body;
        console.log("userId is ", userId);
        console.log("commentId is ", commentId);
        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        return res.statu(200).json({ message: 'Failed', error: error.message });
    }
}

