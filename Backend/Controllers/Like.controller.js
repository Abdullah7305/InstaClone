const Likes = require('../Models/Like.model');

const savePostLike = async (req, res) => {
    try {
        const { postId, userId } = req.body;

        const likeExist = await Likes.findOne({ postId: postId });
        console.log("Like Exists ===>>", likeExist);

        if (likeExist == null) {
            const postLike = await Likes.create({
                postId: postId,
                likesCounts: [userId]
            })
            return res.status(201).json({ message: 'Success' });
        }

        let userLikeExist = likeExist.likesCounts.includes(userId);
        if (userLikeExist) {
            likeExist.likesCounts = likeExist.likesCounts.filter(likeId => likeId != userId)
            await likeExist.save()
            return res.status(200).json({ message: 'User Dislike the Post' });
        }
        else {
            likeExist.likesCounts.push(userId);
            await likeExist.save()
            console.log("Like Saved", likeExist)
            return res.status(200).json({ message: 'User like the Post ' });
        }



    } catch (error) {
        console.log("Error in liking the post is ", error.message)
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

const sendPostLikes = async (req, res) => {
    try {
        const { userid } = req.query;
       

        const likes = await Likes.find({ userId: userid });

        if (likes.length > 0) {
            return res.status(200).json({ message: 'Success', likes: likes })
        }
        return res.status(200).json({ message: 'Failed No likes' })

    } catch (error) {
        console.log("Error in sending  likes is ", error.message)
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

module.exports = { savePostLike, sendPostLikes };