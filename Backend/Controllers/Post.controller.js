const Post = require('../Models/Post.model');
const Comments = require('../Models/Comment.model')
const { createFilePath, createPost, updatePost, deletePostFunc } = require('../Services/post.services')


exports.createPost = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { title, description } = req.body;

        let filePath = createFilePath(req.file.path);


        const post = await createPost({ userId, title, description, filePath })

        if (!userId || userId == undefined) {
            return res.status(400).json({ message: 'No user Found' });
        }
        return res.status(201).json({ message: 'Post Created Successfully', post: post });

    } catch (error) {
        return res.status(500).json({ message: `Failed to save Post`, error: error })
    }
}



exports.postsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId || userId == undefined) {
            return res.status(400).json({ message: 'No user Found' });
        }

        //POST + COMMENTS TO SEND
        const posts = await Post.find({ userId: userId });
        const postIds = posts.map(post => post._id);
        const commentGroups = await Comments.aggregate([
            { $match: { postId: { $in: postIds } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    postId: 1,
                    commentText: 1,
                    commentLikes: 1,
                    user: { _id: '$user._id', username: '$user.username', name: '$user.name', profilePicPathUrl: '$user.profilePicPathUrl' }
                }
            },
            { $group: { _id: '$postId', comments: { $push: '$$ROOT' } } }
        ]);


        let commentMap = {};
        for (let group of commentGroups) {
            commentMap[group._id.toString()] = group.comments;

        }

        const postsWithComments = posts.map(post => {
            const postId = post._id.toString();

            return {
                ...post.toObject(),
                comments: commentMap[postId] || []
            };
        });

        if (postsWithComments.length > 0) {
            return res.status(200).json({ message: 'Success', postsWithComments: postsWithComments })
        }

        return res.status(200).json({ message: 'No Post Avalaible' })
    } catch (error) {
        return res.status(500).json({ message: `Failed while sending post to user`, error: error })
    }
}



exports.editPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { title, description } = req.body;
        let filePath = createFilePath(req.file.path);


        const updatedPost = await Post.findById({ _id: postId });


        if (updatedPost) {
            const filePathToDelete = await updatePost(updatedPost, title, description, filePath)
            await updatedPost.save();
        }
        // const updatedPost = await Post.findByIdAndUpdate({ _id: postId }, { $set: { title: title, description: description, filePath: filePath } })

        return res.status(200).json({ message: 'Success' })

    } catch (error) {
        console.log("Error while Editing Post", error)
        return res.status(500).json({ message: 'Failed to edit Post ', error: error })
    }
}



exports.deletePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        if (!postId || postId == undefined) {
            return res.status(400).json({ message: 'No user Found' });
        }


        let deletedPost = await Post.findById({ _id: postId });


        if (deletedPost) {
            deletePostFunc(deletedPost);
            deletedPost = await Post.findByIdAndDelete({ _id: postId })
            let deleteComments = await Comments.deleteMany({ postId: postId })
        }


        return res.status(200).json({ message: 'Post deleted', deletedPost: deletedPost })
    } catch (error) {
        console.log("Error in delting the Post is ", error)
        return res.status(500).json({ message: `Failed while sending post to user`, error: error })
    }
}