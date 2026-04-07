const { changeUserAccountStatus } = require('../Services/settings.services')

exports.changeAccountStatus = async (req, res) => {
    try {
        const { userid } = req.params.userid;
        const { status } = req.body;
        console.log("Account status data ", status, userid);
        const statusUpdated = await changeUserAccountStatus(userid, status)
        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed', error: error.message })
    }
}

