const express = require('express');
const Router = express.Router();
const { sendNotification, sendDetailedNotifications } = require('../Controllers/Notification.controller');
const protect = require('../Middlewares/jwt.middleware')

Router
    .route('/:notifyId')
    .get(sendNotification)

Router
    .route('/details/:notifyId')
    .get(sendDetailedNotifications)



module.exports = Router;
