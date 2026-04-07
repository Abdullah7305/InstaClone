const bcrypt = require('bcrypt');

exports.bcryptPassword = async (password) => {
    const hashedPswd = await bcrypt.hash(password, 12);
    return hashedPswd;
}