### 这个是websocket的测试demo

第一个是原生websocket的测试案例
以下是相关知识点

WebSocket是HTML5新增的一种通信协议，其特点是服务端可以主动向客户端推送信息，客户端也可以主动向服务端发送信息，是真正的双向平等对话，属于服务器推送技术的一种。

为了建立一个WebSocket连接，浏览器首先要向服务器发起一个HTTP请求，这个请求和通常的HTTP请求不同，包含了一些附加头信息，其中附加头信息Upgrade: WebSocket表明这是一个申请协议升级的HTTP请求。服务端解析这些头信息，然后产生应答信息返回给客户端，客户端和服务端的WebSocket连接就建立起来了。双方就可以通过这个连接通道自由的传递信息，并且这个连接会持续直到客户端或者服务端的某一方主动关闭连接。

### WebSocket 原理
WebSocket是一种双向通信协议，它建立在TCP之上，同HTTP一样通过TCP来传输数据，但与HTTP最大不同的是：

WebSocket是一种双向通信协议，在建立连接后，WebSocket服务器和Browser/UserAgent都能主动的向对象发送或接收数据，就像Socket一样，不同的是WebSocket是一种建立在Web基础上的简单模拟Socket的协议。

WebSocket需要通过握手连接，类似TCP也需要客户端和服务端进行握手连接，连接成功后才能相互通信。

简单说明下WebSocket握手的过程

当Web应用端调用new WebSocket(url)接口时，Browser就开始了与地址为URL的WebServer建立握手连接的过程。

Browser与WebSocket服务器通过TCP三次握手建立连接，如果这个建立连接失败，那么后面的过程就不会执行，Web应用将收到错误消息通知。

在TCP建立连接成功后，Browser/UserAgent通过HTTP协议传送WebSocket支持的版本号、协议的字版本号、原始地址、主机地址等一系列字段给服务端。

WebSocket服务器收到Browser/UserAgent发送来的握手请求后，如果数据包数据和格式正确，客户端和服务端的协议版本匹配等，就接受本次握手连接，并给出对应的数据回复，同样回复的数据包也是采用HTTP协议传输。

Browser收到服务器回复的数据包后，如果数据包内容、格式都没有问题的话，就表示本次连接成功，触发onopen消息，此时Web开发者就可以在此时通过send接口向服务器发送数据。否则，握手连接失败，Web应用会收到onerror消息，并且能知道连接失败的原因。

### WebSocket Server

如果要搭建一个WebServer，我们会有很多选择，市场上也有很多成熟的产品供我们是使用。例如开源的Apache，安装配置后即可工作。但如果想要搭建一个WebSocket服务器就没有那么轻松，因为WebSocket是一种新的通信协议，目前还是草案，没有成为标准，市场上也没有成熟的WebSocket服务器或Library实现WebSocket协议，我们必须自己手动编码去解析和组装WebSocket的数据包。要完成一个WebSocket服务器，估计所有的人都想放弃，不过市场上有几款比较好的开源Library可供使用。例如PyWebSocket、WebSocket-Node、LibWebSockets等，这些Library已经实现了WebSocket数据包的封装和解析，我们可以调用这些接口，这在很大程度上减少了我们的工作量。

### WebSocket与TCP、HTTP的关系

WebSocket与HTTP协议一样都是基于TCP的，所以它们都是可靠的协议，Web开发者调用的WebSocket的send函数在Browser的实现中最终都是通过TCP的系统接口进行传输的。

WebSocket和HTTP协议样都属于应用层协议，那么它们之间有没有什么关系呢？

答案是肯定的，WebSocket在建立握手连接时，数据是通过HTTP协议传输的。但在建立连接之后，真正的数据传输阶段是不需要HTTP参与的。

第二个是socket.io的测试案例

#### Socket.io
socket.io是一个跨浏览器支持WebSocket的实时通讯的JS。

Socket.io支持及时、双向、基于事件的交流，可在不同平台、浏览器、设备上工作，可靠性和速度稳定。最典型的应用场景如：

实时分析：将数据推送到客户端，客户端表现为实时计数器、图表、日志客户。
实时通讯：聊天应用
二进制流传输：socket.io支持任何形式的二进制文件传输，例如图片、视频、音频等。
文档合并：允许多个用户同时编辑一个文档，并能够看到每个用户做出的修改。
Socket.io实际上是WebSocket的父集，Socket.io封装了WebSocket和轮询等方法，会根据情况选择方法来进行通讯。

Node.js提供了高效的服务端运行环境，但由于Browser对HTML5的支持不一，为了兼容所有浏览器，提供实时的用户体验，并为开发者提供客户端与服务端一致的编程体验，于是Socket.io诞生了。

```
# npm安装socket.io
$ npm install --save socket.io
```
#### Socket.io 基本应用
服务端

服务端socket.io必须绑定一个http.Server实例，因为WebSocket协议是构建在HTTP协议之上的，所以在创建WebSocket服务时需调用HTTP模块并调用其下createServer()方法，将生成的server作为参数传入socket.io。

```
const express = require("express");
const app = express();
// 通过node的http模块来创建一个server服务
const server = require("http").createServer(app);

// WebSocket是依赖HTTP协议进行握手的
const io = require("socket.io")(server);

//开启node的http服务，监听3000端口 
server.listen(3000, () => {
    console.log("Your node server is listening on port 3000");
});
```

文档地址 http://socket.io/docs/