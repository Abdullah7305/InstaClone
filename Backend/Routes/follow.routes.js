const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware');
const { sendFollowData, followRequest, acceptRequest, rejectRequest } = require('../Controllers/Follow.controller')

Router
    .route('/follow/:userId')
    .get(sendFollowData)
    .post(followRequest)
Router
    .route('/reject')
    .put(rejectRequest)

Router
    .route('/accept')
    .put(acceptRequest)

module.exports = Router;