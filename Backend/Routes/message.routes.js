const express = require('express');
const Router = express.Router();
const { createMessage, userChatList, loadDirectMessages } = require('../Controllers/Message.controller');

Router
    .route('/sent')
    .put(createMessage);

Router
    .route('/chat/list')
    .get(userChatList)

Router
    .route('/load')
    .get(loadDirectMessages)

module.exports = Router;