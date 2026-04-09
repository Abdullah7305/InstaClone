const express = require('express');
const Router = express.Router();
const { createMessage } = require('../Controllers/Message.controller');

Router
    .route('/sent')
    .put(createMessage);

module.exports = Router;