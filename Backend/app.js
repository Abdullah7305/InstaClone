require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./Routes/auth.routes.js');
const profileRoute = require('./Routes/profile.routes.js')
const postRoutes = require('./Routes/post.routes.js');
const followRoutes = require('./Routes/follow.routes.js');
const notificationRoutes = require('./Routes/notification.routes.js');

mongoose.connect('mongodb://localhost:27017/InstagramClone')
    .then(() => {
        console.log('MongoDb Connected')
    })
    .catch(() => {
        console.log("Error while connecting DB")
    })

const app = express();
app.use(express.json());
app.use(
    '/uploads',
    express.static(path.join(__dirname, 'Services', 'uploads'))
);
app.use(cors());
app.use('/auth', authRoutes);
app.use('/user', profileRoute);
app.use('/post', postRoutes);
app.use('/request', followRoutes);
app.use('/notification', notificationRoutes)



module.exports = app;