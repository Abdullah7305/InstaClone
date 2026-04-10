const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware');
const upload = require('../Services/multer.services');
const { getSuggestions } = require('../Controllers/Suggestions.controller');
const { editUserProfilePic, sendUserProfile } = require('../Controllers/Profile.controller');
const { postsByUserId } = require('../Controllers/Post.controller');
const { changeAccountStatus } = require('../Controllers/Settings.controller');


Router
    .route('/profile/:userId')
    .put(protect,upload.single('image'), editUserProfilePic)
    .get(protect,sendUserProfile)

Router
    .route('/posts/:userId')
    .get(protect,postsByUserId)

Router
    .route('/suggestions/:userId')
    .get(protect,getSuggestions)

Router
    .route('/accountStatus/:userid')
    .patch(protect,changeAccountStatus)


module.exports = Router;