const express = require("express");
const app = express();
const http = require("http");
// WebSocket是依赖HTTP协议进行握手的
const server = http.createServer(app);
const path = require("path");

// 设置静态文件夹 注意：这边设置的是文件夹，不能设置成 ./static /static ./static/index.html 前端会报 Cannot GET /index.html
app.use(express.static(path.resolve(__dirname, "static")));

const io = require("socket.io")(server);
const SYSTEM = "系统";
//用来保存socket实例的对象
let socketObj = {};
//设置一次额颜色的数组，让每次进入聊天室的用户颜色不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

// 记录一个socket.id用来查找用户
let mySocket = {};

// 创建一个数组来保存最近的20条消息记录，真实项目是存放到数据库中的
let msgHistory = [];

//打乱数组的方法
function upsetArr(arr) {
    let len = arr.length,
        random;
    while (len !== 0) {
        len--;
        // 右移位运算符向下取整
        random = (Math.random() * len) >>> 0;
        // 解构赋值实现变量互换
        [arr[random], arr[len]] = [arr[len], arr[random]];
    }
    return arr;
}

// 小于10的补0方法
function addZero(n) {
    return n > 10 ? '' + n : '0' + n
}

// 获取当前时间并格式化的方法 11:15:10
function getCreateAt(date) {
    return `${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`
}

io.on("connection", (socket) => {
    console.log("服务端socket连接成功");
    // 记录用户名，用来记录是不是第一次进入，默认是undefined
    let username = "";
    let color = "";
    //用来记录进入了哪些房间的数组
    let rooms = [];
    // 这是所有连接到服务端的socket.id
    mySocket[socket.id] = socket;
    console.log(socket.id);
    // 发送一个getId事件，通知客户端当前连接到socket实例ID
    socket.emit("getId", socket.id);

    // 监听客户端发过来的消息 socket为当前实例
    socket.on("message", (msg) => {
        console.log(msg);
        // const createTime = getCreateAt();
        if (!username) { //用户名不存在，是第一次进入
            //第一次进来后输入的内容当作用户名
            username = msg;
            // 把socketObj对象上对应的用户名赋为一个socket
            socketObj[username] = socket;
            // 向除了自己的所有人广播，毕竟进没进入自己是知道的，没必要跟自己再说一遍 
            socket.broadcast.emit("message", {
                user: SYSTEM,
                color,
                content: `尊敬的${username}加入了聊天`,
                createAt: getCreateAt(new Date())
            });
        } else { //用户名存在，不是第一次进入
            // 乱序后取出颜色数组中的第一个，分配给进入的用户
            color = upsetArr(userColor)[0];
            // 正则判断消息是否为私聊专属 @james 12".match(reg) =>  ["@james 12", "james", "12", index: 0, input: "@james 12", groups: undefined]
            // 正则：[^ ]+ 除了空格之外的其他字符
            let isPrivate = msg.match(/@([^ ]+) (.+)/);
            if (isPrivate) { //私聊
                // 私聊的用户，正则匹配后的第一个分组
                let toUser = isPrivate[1];
                // 私聊的内容，正则匹配后的第二个分组
                let content = isPrivate[2];
                // 私聊的socket实例
                let toSocket = socketObj[toUser];
                console.log(toUser, content, toSocket);
                if (toSocket) {
                    let msgObj = {
                        user: username,
                        color,
                        content,
                        id: socket.id,
                        createAt: getCreateAt(new Date())
                    }
                    // 向私聊的用户发送信息
                    toSocket.send(msgObj);
                    // 再发送给自己(显示在自己的聊天面板中)
                    socket.send(msgObj);
                }
            } else { // 公聊 直接发给所有人
                //不管是在房间内还是房间外，消息对象都是一样的，所包装起来下面直接赋值
                let msgObj = {
                    user: username,
                    color,
                    content: msg,
                    id: socket.id,
                    createAt: getCreateAt(new Date())
                };
                // 如果rooms数组中有成员，就代表有用户进入了房间
                if(rooms.length) {
                    // 用来存储进入房间内的socket.id
                    let socketJson = {};
                    rooms.forEach(room => {
                        // 取得进入房间内所对应的所有sockets的hash值，它便是拿到的socket.id
                        let roomSockets = io.sockets.adapter.rooms[room].sockets;
                        Object.keys(roomSockets).forEach(socketId => {
                            // 进行一个去重，在socketJson中只有对应唯一的socketId
                            if(!socketJson[socketId]) {
                                socketJson[socketId] = 1;
                            }
                        })
                    });

                    // 遍历socketJson,获取sicketId在mySocket里找到对应的socket实例,然后发送消息
                    Object.keys(socketJson).forEach(socketId => {
                        mySocket[socketId].emit("message", msgObj)
                    });
                } else {
                    // 如果没有进入房间，就是向所有人广播消息
                    io.emit("message", msgObj);
                    // 把发送的消息push存到消息数组 msgHistory 中
                    msgHistory.push(msgObj);
                }
                
            }

        }
    });

    socket.on("getHistory", () => {
        if(msgHistory.length) {
            // 通过数组的slice方法截取最新的20条消息
            let history = msgHistory.slice(msgHistory.length - 20);
            // 发送history事件并返回 history 数组给客户端
            socket.emit("history", history);
        }
    })

    //监听用户进入房间的事件
    socket.on("join", room => {
        // 只有用户名存在并且该用户不在房间数组中才可以进来
        if (username && !rooms.includes(room)) {
            socket.join(room, () => {
                console.log(`${username}已进入${room}房间`)
            });
            rooms.push(room);
            // 这里发送个joined事件，让前端监听后，控制房间按钮显隐
            socket.emit("joined", room);
            // 在进入的房间通知一下自己
            socket.send({
                user: username,
                color,
                content: `你已加入${room}战队`,
                createAt: getCreateAt(new Date())
            })
        }
    })

    //监听用户离开房间的事件
    socket.on("leave", room => {
        let _index = rooms.indexOf(room);
        // 只有用户在房间里时 才可以离开房间
        if (_index !== -1) {
            socket.leave(room, () => {
                console.log(`${username}已离开${room}房间`)
            })
            rooms.splice(_index, 1);
            // 这里发送个leaved事件，让前端监听后，控制房间按钮显隐
            socket.emit("leaved", room);
            socket.send({
                user: username,
                color,
                content: `你已离开${room}战队`,
                createAt: getCreateAt(new Date())
            })
        }
    })

});

// 这里要用server去监听端口，而非app.listen去监听(不然找不到/socket.io/socket.io.js文件)
server.listen(4000, () => {
    console.log("Your http server is listening on port 4000");
});