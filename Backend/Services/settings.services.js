const User = require('../Models/User.model');

exports.changeUserAccountStatus = async (userId, status) => {

    const userAccountUpdate = await User.updateOne({ _id: userId }, { $set: { accountStatus: status } });
    let isUpdated = false;
    if (userAccountUpdate.matchedCount > 0) {
        isUpdated = true;
    }
    return isUpdated;
}

