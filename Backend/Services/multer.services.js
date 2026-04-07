const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadAddress = path.join(__dirname, 'uploads')

if (!fs.existsSync(uploadAddress)) {
    fs.mkdirSync(uploadAddress);
}



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadAddress)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
    }
});

const upload = multer({ storage: storage })


module.exports = upload;