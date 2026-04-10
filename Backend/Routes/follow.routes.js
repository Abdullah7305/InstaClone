const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware');
const { sendFollowData, followRequest, acceptRequest, rejectRequest } = require('../Controllers/Follow.controller')

Router
    .route('/follow/:userId')
    .get(protect,sendFollowData)
    .post(protect,followRequest)
Router
    .route('/reject')
    .put(protect,rejectRequest)

Router
    .route('/accept')
    .put(protect,acceptRequest)

module.exports = Router;