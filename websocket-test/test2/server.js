const express = require("express");
const app = express();
const path = require("path");

// 设置静态文件夹
app.use(express.static(path.resolve(__dirname, "static")));

// 通过node的http模块来创建一个server服务
const server = require("http").createServer(app);

// WebSocket是依赖HTTP协议进行握手的
const io = require("socket.io")(server);

//监听客户端与服务端的连接
io.on("connection", (socket) => {
    socket.send("青花瓷");
    // 客户端连接过来的那个socket对象
    socket.on("message", (msg) => {
        // 客户端发来的消息
        console.log(msg);
        socket.send("天青色等烟雨，而我在等你");
    })
});

//开启node的http服务，监听3000端口 
server.listen(3000, () => {
    console.log("Your node server is listening on port 3000");
});

