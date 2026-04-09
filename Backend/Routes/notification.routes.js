const express = require('express');
const Router = express.Router();
const { sendNotification, sendDetailedNotifications, deleteNotifcation } = require('../Controllers/Notification.controller');
const protect = require('../Middlewares/jwt.middleware')

Router
    .route('/:notifyId')
    .get(sendNotification)

Router
    .route('/details/:notifyId')
    .get(sendDetailedNotifications)

Router
    .route('/delete')
    .delete(deleteNotifcation)



module.exports = Router;
