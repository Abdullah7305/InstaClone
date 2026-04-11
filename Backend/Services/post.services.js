const Post = require('../Models/Post.model')
const path = require('path');
const fs = require('fs/promises');

exports.createFilePath = (filePath) => {
    if (filePath == '' || filePath == undefined) {
        console.log("File Path is Undefined");
        return;
    }
    filePath = filePath.split('uploads');
    filePath = filePath.pop();
    filePath = filePath.replace(/^[/\\]/, "/");
    return filePath

}

exports.createPostService = async ({ userId, title, description, filePath }) => {
    const post = await Post.create({
        userId: userId,
        title: title,
        description: description,
        imageUrl: filePath
    })
    return post;
}

exports.updatePost = async (updatedPost, title, description, filePath) => {
    const filename = path.basename(updatedPost.imageUrl);
    const filePathToDelete = path.join(__dirname, '..', 'Services', 'uploads', filename);
    await fs.unlink(filePathToDelete, (err) => {
        console.log("Error while deleting Post Pic ", err)
    })
    updatedPost.title = title;
    updatedPost.description = description;
    updatedPost.imageUrl = filePath;

}

exports.deletePostFunc = async (deletedPost) => {
    const filename = path.basename(deletedPost.imageUrl);
    const filePath = path.join(__dirname, '..', 'Services', 'uploads', filename);
    fs.unlink(filePath, (err) => {
        console.log("Error while deleting Post Pic ", err)
    })

}
