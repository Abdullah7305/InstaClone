const User = require('../Models/User.model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../Services/jwt.services')
const { checkRequestBody, findUser, saveUser } = require('../Services/auth.services')
const { bcryptPassword } = require('../Services/bcrypt.services')

//signup-post -req-function executes
exports.createAccount = async (req, res) => {
    try {

        const { name, username, email, password } = req.body;
        let checkRequest = checkRequestBody(req.body);
        if (checkRequest === false) {
            console.log("Check Body True");
            return res.status(400).json({ message: 'Invalid User Data' })
        }

        const userExist = await findUser({ email, username });

        if (userExist.length > 0) {
            console.log("userExist True");
            return res.status(400).json({ message: 'User Exist already try another account/username' })
        }
        const hashedPassword = await bcryptPassword(password);

        const saveNewUser = await saveUser({ name, username, email, hashedPassword })

        const token = generateToken(saveNewUser._id, saveNewUser.name, saveNewUser.username, saveNewUser.email)

        return res.status(201).json({ message: 'Account Created Successfully...', token: token, user: saveNewUser });

    } catch (error) {
        console.log("Error is ", error)
        res.status(500).json({ message: 'Error while saving user ', error: error })
    }
}


//for signin we execute this one  
exports.verifyLoginAccount = async (req, res) => {
    try {
        console.log("Request hitting....")
        const { email, password } = req.body;
        const checkRequest = checkRequestBody(req.body);

        if (checkRequest === false) {
            return res.status(400).json({ message: 'Invalid User Data' })
        }
        const userExist = await User.findOne({ email: email });
        if (!userExist) {

            return res.status(400).json({ message: 'Create Account Please..' })
        }
        const isPaswdMatched = await bcrypt.compare(password, userExist.password)
        if (!isPaswdMatched) {
            return res.status(400).json({ message: 'Email or Password in Invalid' })
        }

        const token = generateToken(userExist._id, userExist.name, userExist.username, userExist.email)
        return res.status(201).json({ message: 'Verification  Successfull...', token: token, user: userExist })
    } catch (error) {
        res.status(500).json({ message: 'Error while verifying user ', error: error })
    }
}