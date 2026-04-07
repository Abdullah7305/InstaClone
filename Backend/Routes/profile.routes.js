const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware');
const upload = require('../Services/multer.services');
const { getSuggestions } = require('../Controllers/Suggestions.controller');
const { editUserProfilePic, sendUserProfile } = require('../Controllers/Profile.controller');
const { postsByUserId } = require('../Controllers/Post.controller');
const { changeAccountStatus } = require('../Controllers/Settings.controller')


Router
    .route('/profile/:userId')
    .put(upload.single('image'), editUserProfilePic)
    .get(sendUserProfile)

Router
    .route('/posts/:userId')
    .get(postsByUserId)

Router
    .route('/suggestions/:userId')
    .get(getSuggestions)

Router
    .route('/accountStatus/:userid')
    .patch(changeAccountStatus)


module.exports = Router;