const jwt = require('jsonwebtoken')

exports.generateToken = (id, name, username, email) => {
    try {
        const token = jwt.sign(
            {
                userId: id,
                username: username,
                name: name,
                email: email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }

        )
        console.log("Token created Successfully..")
        return token;
    } catch (error) {
        console.log("Error while making the JWT token ", error)
        return error;
    }
}



