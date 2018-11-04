let list = document.getElementById("list"),
    input = document.getElementById("input"),
    sendBtn = document.getElementById("sendBtn"),
    alertDom = document.getElementsByClassName("alert")[0];
let userId = "";

class Init {
    showAlertDom(htmlText, opacity) {
        alertDom.innerHTML = htmlText;
        alertDom.style.opacity = opacity;
    }
}

const init = new Init();
init.showAlertDom("", 0);

// 私聊
list.onclick = function (event) {
    console.log(event.target);
    let e = event || window.event;
    privateChat(e);
}


//创建一个socket对象
const socket = io();

// 监听与服务端连接的事件
socket.on("connect", () => {
    console.log("connect");
    init.showAlertDom("", 0);
    // 一连接后就获取历史消息
    getHistory();
});

// 监听接收到服务端发来消息的事件
socket.on("message", (msg) => {
    console.log(msg, userId);
    let msgObj = msg;
    createLi(msgObj);
});

// 监听与服务端断开的事件
socket.on("disconnect", (err) => {
    console.log(err);
    init.showAlertDom("已与服务端断开连接", 1);
});

// 监听事件，获取对应的用户id
socket.on("getId", id => {
    console.log(id);
    userId = id;
})

// 点击按钮发送消息
sendBtn.onclick = send;
input.onkeydown = function (event) {
    let e = event || window.event;
    enterSend(e);
}

// 发送一条内容就创建一个li
function createLi(data) {
    let li = document.createElement("li"),
        ul = document.getElementById("list");
    li.className = 'list-group-item';
    li.style.textAlign = data.id === userId ? "right" : "left";
    data.user = data.id === userId ? "我" : data.user;
    li.innerHTML = `
        <p style="color: #ccc;">
            <span class="user" style="color:${data.color}">${data.user}</span>
            ${data.createAt}
        </p>
        <p class="content" style="background:${data.color}">${data.content}</p>
    `;
    ul.appendChild(li);
    // 将聊天区域的滚动条设置到最新内容的位置
    ul.scrollTop = ul.scrollHeight;
}

// 私聊功能
function privateChat(e) {
    let {
        target
    } = e;
    // 拿到对应的用户名
    let user = target.innerHTML;
    // 只有class为user的才是目标元素
    if (target.className === "user") {
        if(user === "我") {
            init.showAlertDom("不能与自己私聊哦", 1);
            return;
        }
        input.value = `@${user} `;
    }
}

// 获取历史消息
function getHistory() {
    socket.emit("getHistory");
    socket.on("history", history => {
        console.log("getHistory", history);
        // history拿到的是一个数组，所以用map映射成新数组，里面返回的是dom结构字符串，再将新数组用join转换成字符串
        let historyHtmlStr = history.map(data => {
            return `
            <li class="list-group-item">
                <p style="color: #ccc;">
                    <span class="user" style="color:${data.color}">${data.user}</span>
                    ${data.createAt}
                </p>
                <p class="content" style="background:${data.color}">${data.content}</p>
            </li>
            `
        }).join("");
        list.innerHTML = historyHtmlStr + `<li style="margin: 16px 0;text-align: center">以上是历史消息</li>`;
        // 将聊天区域的滚动条设置到最新内容的位置
        list.scrollTop = list.scrollHeight;
    });
}

// 发送消息的方法
function send() {
    let value = input.value;
    init.showAlertDom("", 0);
    if (value != "") {
        // 发送消息给服务器
        socket.emit('message', value);
        input.value = '';
    } else {
        init.showAlertDom("发送的内容不能为空", 1);
    }
}

// 回车发送消息的方法
function enterSend(event) {
    let {
        keyCode
    } = event;
    if (keyCode === 13) send();
}

// 监听是否已进入房间
// 如果已进入房间， 就隐藏进入房间的按钮，显示离开房间的按钮
socket.on("joined", (room) => {
    document.getElementById(`join-${room}`).style.display = "none";
    document.getElementById(`leave-${room}`).style.display = "inline-block";
});

socket.on("leaved", (room) => {
    document.getElementById(`join-${room}`).style.display = "inline-blick";
    document.getElementById(`leave-${room}`).style.display = "none";
});

// 进入房间的方法
function join(room) {
    socket.emit("join", room);
}

//离开房间的方法
function leave(room) {
    socket.emit("leave", room);
}

