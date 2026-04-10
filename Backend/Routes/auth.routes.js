const express = require('express');
const Router = express.Router();
const { createAccount, verifyLoginAccount } = require('../Controllers/Auth.controller');

Router
    .route('/signup')
    .post(createAccount)

Router
    .route('/login')
    .post(verifyLoginAccount)

module.exports = Router;
