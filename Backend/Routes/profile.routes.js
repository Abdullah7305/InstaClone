const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware');
const upload = require('../Services/multer.services');
const { getSuggestions } = require('../Controllers/Suggestions.controller');
const { editUserProfilePic, sendUserProfile, sendUserPosts } = require('../Controllers/Profile.controller');
const { changeAccountStatus } = require('../Controllers/Settings.controller')


Router
    .route('/profile/:accountId')
    .put(upload.single('image'), editUserProfilePic)
    .get(sendUserProfile)

Router
    .route('/posts/:userId')
    .get(sendUserPosts)

Router
    .route('/suggestions/:userId')
    .get(getSuggestions)

Router
    .route('/accountStatus/:userid')
    .patch(changeAccountStatus)


module.exports = Router;