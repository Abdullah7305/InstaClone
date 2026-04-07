const User = require('../Models/User.model');
const Post = require('../Models/Post.model');
const fs = require('fs/promises');
const { createFilePath } = require('../Services/post.services');
const FollowRequest = require('../Models/FollowRequest.model');



exports.editUserProfilePic = async (req, res) => {
    try {
        const { userId, bio } = req.body;

        // safe file extraction
        const filePath = req.file ? req.file.path : null;

        // ---------- VALIDATION ----------
        if (!userId) {
            return res.status(400).json({ message: 'No user id found' });
        }

        // ---------- FIND USER ----------
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ---------- CHECK IF ANYTHING TO UPDATE ----------
        if (bio === undefined && !filePath) {
            return res.status(400).json({ message: 'Nothing to update' });
        }

        // ---------- UPDATE BIO ----------
        if (bio !== undefined) {
            user.bio = bio;
        }

        // ---------- UPDATE PROFILE PICTURE ----------
        if (filePath) {

            // delete old image if exists
            if (user.profilePicPathUrl) {
                console.log("Profile Picture Url was ", user.profilePicPathUrl)

                fs.unlink(user.profilePicPathUrl, (err) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    }
                });
                console.log("User picture deleted Successfully...")
            }

            user.profilePicPathUrl = filePath;
        }

        // ---------- SAVE ----------
        await user.save();

        // ---------- RESPONSE ----------
        return res.status(200).json({
            message: 'Profile updated successfully',
            bio: user.bio,
            profilePicPath: user.profilePicPathUrl
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed while updating profile',
            error: error.message
        });
    }
}

exports.sendUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Request Hitting...", userId)
        if (!userId || userId == undefined) {
            return res.status(400).json({ message: 'Failed:No user id found' })
        }

        const user = await User.findOne({ _id: userId });

        let profileImageAddress = createFilePath(user.profilePicPathUrl);

        if (user) {
            const requestStatus = await FollowRequest.findOne({ following: userId });
            if (requestStatus) {

                return res.status(200).json({ message: 'Success', accountStatus: user.accountStatus, requestStatus: requestStatus.requestStatus, username: user.username, img: profileImageAddress, bio: user.bio })
            }
            return res.status(200).json({ message: 'Success', accountStatus: user.accountStatus, requestStatus: 'Follow', username: user.username, img: profileImageAddress, bio: user.bio })

        }
        return res.status(400).json({ message: 'User Not Found' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Failed while sending Profile ', error: error })
    }
}


