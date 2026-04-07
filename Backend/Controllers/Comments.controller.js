const Comment = require('../Models/Comment.model');

exports.createComment = async (req, res) => {
    try {
        const { postId, commentText } = req.body;
        
    } catch (error) {
        return res.statu(200).json({ message: 'Failed', error: error.message });
    }
}