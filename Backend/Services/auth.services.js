const User = require('../Models/User.model');

exports.checkRequestBody = ({ req }) => {
    for (let key in req) {
        if (req.body[key] == '') {
            return false;
        }
    }
    return true;
}

exports.findUser = async ({ email, username }) => {
    const userExist = await User.find({ $or: [{ email: email, username: username }] });
    console.log("User Exist ", userExist)
    return userExist
}

exports.saveUser = async ({ name, username, email, hashedPassword }) => {
    const saveUser = await User.create({
        name: name,
        username: username,
        email:email,
        profilePicPathUrl: '',
        bio: '',
        accountStatus:'public',
        password: hashedPassword,
    })
    return saveUser;
}
