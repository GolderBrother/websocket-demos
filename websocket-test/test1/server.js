const express = require("express");
const app = express();
const path = require("path");
const { Server } = require("ws");

// 设置静态文件夹 注意：这边设置的是文件夹，不能设置成 ./static /static ./static/index.html 前端会报 Cannot GET /index.html
app.use(express.static(path.resolve(__dirname, "static/")));
// app.use(express.static(__dirname));

// 使用express创建一个本地服务
app.listen(3000, () => {
    console.log("Your node server is listening on port 3000");
});

// 开启websocket服务，监听9999端口
const ws = new Server({port:9999}, () => {
    console.log("Your websocket server is listening on port 9999")
});

ws.on("connection", function(socket) {
    socket.on("message", (msg) => {
        // 这个就是客户端发来的消息
        console.log(msg);  
        socket.send(`这里是服务端对你说的话:${msg}`, () => {
            console.log("服务端已经响应给客户端消息了")
        }) 
    })
})

