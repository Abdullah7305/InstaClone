const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;


function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        console.log(SECRET_KEY);
        
        if(!authHeader){
            return res.status(400).json({ message: 'Token Not Found' })
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ message: 'Invalid Token' })
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;
        next();

    } catch (error) {
        console.log(error.message);
        
        return res.status(400).json({ message: `Failed From middleware : ${error}` })
    }
}

module.exports = protect;