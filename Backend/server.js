const app = require('./app');
const http = require('http');
const socketManager = require('./socket');
const onlineUsers = require('./onlineUsers');

const server = http.createServer(app);

const io = socketManager.init(server);



io.on("connection", (socket) => {
    console.log("User Connected: ", socket.id);

    // Register User

    socket.on("register", (userId) => {
        onlineUsers[userId] = socket.id;
        socket.userId = userId;
        console.log("User registered: ", userId);
    });

    socket.on("disconnect", () => {
        if (socket.userId) {
            delete onlineUsers[socket.userId];
            console.log("User disconnected..", socket.userId);
        }
    })
})

server.listen(8000, () => {
    console.log("Server is Listening...")
})