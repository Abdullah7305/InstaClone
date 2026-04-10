const express = require('express');
const Router = express.Router();
const protect = require('../Middlewares/jwt.middleware')
const upload = require('../Services/multer.services');
const { postsByUserId, sendAllPosts, createPost, editPost, deletePost } = require('../Controllers/Post.controller');
const { createComment } = require('../Controllers/Comments.controller')
const { savePostLike, sendPostLikes } = require("../Controllers/Like.controller")
Router
    .route('/user/comment/:userId')
    .post(protect, createComment)


Router
    .route('/likes')
    .post(protect, savePostLike)
    .get(protect, sendPostLikes)

Router
    .route('/allposts')
    .get(protect,sendAllPosts)

Router
    .route('/:userId')
    .post(protect,upload.single('image'), createPost)
    .get(protect,postsByUserId)

Router
    .route('/delete')
    .delete(protect,deletePost)

Router
    .route('/edit/:postId')
    .put(protect,upload.single('image'), editPost)



module.exports = Router;
