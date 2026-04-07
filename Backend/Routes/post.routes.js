const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware')
const upload = require('../Services/multer.services');
const { postsByUserId, createPost, editPost, deletePost } = require('../Controllers/Post.controller');

Router
    .route('/:userId')
    .post(upload.single('image'), createPost)
    .get(postsByUserId)
Router
    .route('/delete')
    .delete(deletePost)
Router
    .route('/edit/:postId')
    .put(upload.single('image'), editPost)

module.exports = Router;
