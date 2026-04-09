const Follow = require('../Models/Follow.model');
const User = require('../Models/User.model');
const mongoose = require('mongoose');

exports.extractSuggestions = async (userId) => {

    const users = await User.find({
        _id: { $ne: new mongoose.Types.ObjectId(userId) }
    }, { email: 0, bio: 0, password: 0 });

    const following = await Follow.find({ userId: userId });

    if (following.length > 0) {//user following exst so filter the suggestion 
        let followSet = new Set(following.following);
        let suggestions = [];
        users.forEach(user => {
            if (!followSet.has(user._id)) {
                suggestions.push(user);
            }
        });

        return suggestions;
    }

    return users;

};
