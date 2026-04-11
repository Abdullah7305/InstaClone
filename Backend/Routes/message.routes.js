const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware');
const { sentMessageCount } = require('../Controllers/Notification.controller');
const { createMessage, userChatList, loadDirectMessages, loadMessageNotifications } = require('../Controllers/Message.controller');

Router
    .route('/send')
    .post(protect, createMessage);

Router
    .route('/chat/list')
    .get(protect, userChatList)

Router
    .route('/load')
    .get(protect, loadDirectMessages)

Router
    .route('/notify-num')
    .get(sentMessageCount)

module.exports = Router;