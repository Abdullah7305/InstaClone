const express = require('express');
const Router = express.Router();
const { sendNotification, sendDetailedNotifications, deleteNotifcation } = require('../Controllers/Notification.controller');
const protect = require('../Middlewares/jwt.middleware')

Router
    .route('/:notifyId')
    .get(protect,sendNotification)

Router
    .route('/details/:notifyId')
    .get(protect,sendDetailedNotifications)

Router
    .route('/delete')
    .delete(protect,deleteNotifcation)



module.exports = Router;
