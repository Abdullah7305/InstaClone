const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware');
const { createMessage, userChatList, loadDirectMessages } = require('../Controllers/Message.controller');

Router
    .route('/send')
    .post(protect,createMessage);

Router
    .route('/chat/list')
    .get(protect,userChatList)

Router
    .route('/load')
    .get(protect,loadDirectMessages)

module.exports = Router;