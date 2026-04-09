const Follow = require('../Models/Follow.model');
const User = require('../Models/User.model');
const mongoose = require('mongoose');

exports.extractSuggestions = async (userId) => {

    const userFollowDoc = await Follow.findOne({ userId: userId });


    let excludeIds = [new mongoose.Types.ObjectId(userId)];

    if (userFollowDoc && userFollowDoc.following.length > 0) {
        excludeIds = excludeIds.concat(userFollowDoc.following);
    }


    const suggestions = await User.find({
        _id: { $nin: excludeIds }
    }, {
        email: 0,
        bio: 0,
        password: 0
    });

    console.log(`Found ${suggestions.length} suggestions for user ${userId}`);
    return suggestions;
};
