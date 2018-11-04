this is a chatroom demo for websocket

```
Tips:
socket.send(options):发送消息是为了给自己看的
socket.emit("message", options):一般是为了回应客户端来推送的消息,客户端可以直接监听message事件后获取消息
io.emit("message", options):发送消息是给所有人看的
socket.broadcast.emit("message", options):发送消息除了自己都能看到
```
使用pm2实现服务端守护进程

https://www.cnblogs.com/zhoujie/p/nodejs4.html

### Socket.io 基本应用

socket.io提供了基于事件的实时双向通讯，它同时提供了服务端和客户端的API。

服务端

服务端socket.io必须绑定一个http.Server实例，因为WebSocket协议是构建在HTTP协议之上的，所以在创建WebSocket服务时需调用HTTP模块并调用其下createServer()方法，将生成的server作为参数传入socket.io。

```
var httpServer = require('http').createServer();
var io = require('socket.io')(httpServer);
httpServer.listen(3000);
```
绑定http.Server可使用隐式绑定和显式绑定

隐式绑定
socket.io内部实例化并监听http.Server，通过实例化时传入端口或者在实例化后调用listen或attach函数进行隐式绑定。

```
// 实例化时传入端口
require('socket.io')(3000)

// 通过listen或attach函数绑定
let io = require('socket.io')
io.listen(3000);
// io.attach(3000);
显式绑定
// 实例化时绑定
let httpServer = require('http').Server();
let io = require('socket.io')(httpServer);
httpServer.listen(3000);

//通过listen或attach绑定
let httpServer = require('http').Server();
let io = require('socket.io')();
io.listen(httpServer);
// io.attach(httpServer);
httpServer.listen(3000);
```

#### Express框架中使用

```
let app = require('express')();

let httpServer= require('http').Server(app);
let io = require('socket.io')(httpServer);

app.listen(3000);
```

#### KOA框架中使用

```
let app = require('koa')();

let httpServer = require('http').Server(app.callback());
let io = require('socket.io')(httpServer);

app.listen(3000);
```
建立连接

当服务端和客户端连接成功时，服务端会监听到connection和connect事件，客户端会监听到connect事件，断开连接时服务端对应到客户端的socket与客户端均会监听到disconcect事件。

```
/*客户端*/
<script src="http://cdn.socket.io/stable/socket.io.js"></script>
<script>
// socket.io引入成功后，可通过io()生成客户端所需的socket对象。
let socket = io('http://127.0.0.0:3000');

// socket.emmit()用户客户端向服务端发送消息，服务端与之对应的是socket.on()来接收信息。
socket.emmit('client message', {msg:'hi, server'});

// socket.on()用于接收服务端发来的消息
socket.on('connect',  ()=>{
  console.log('client connect server');
});
socket.on('disconnect', ()=>{
  console.log('client disconnect');
});
</script>
```

```
/*服务端*/
// 服务端绑定HTTP服务器实例
let httpServer = require('http').Server();
let io = require('socket.io')(httpServer);
httpServer.listen(3000);

// 服务端监听连接状态：io的connection事件表示客户端与服务端成功建立连接，它接收一个回调函数，回调函数会接收一个socket参数。
io.on('connection',  (socket)=>{
  console.log('client connect server, ok!');

  // io.emit()方法用于向服务端发送消息，参数1表示自定义的数据名，参数2表示需要配合事件传入的参数
  io.emmit('server message', {msg:'client connect server success'});

  // socket.broadcast.emmit()表示向除了自己以外的客户端发送消息
  socket.broadcast.emmit('server message', {msg:'broadcast'});

  // 监听断开连接状态：socket的disconnect事件表示客户端与服务端断开连接
  socket.on('disconnect', ()=>{
    console.log('connect disconnect');
  });
  
  // 与客户端对应的接收指定的消息
  socket.on('client message', (data)=>{
    cosnole.log(data);// hi server
  });

  socket.disconnect();
});
```
传输数据

服务端和客户端的socket是一个关联的EventEmitter对象，客户端socket派发的事件可以通过被服务端的socket接收，服务端socket派发的事件也可以被客户端接收。基于这种机制，可以实现双向交流。

模拟：客户端不断发送随机数，当随机数大于0.95时，服务端延迟1s后向客户端发送警告以及警告次数。

```
/*客户端*/
<script src="http://cdn.socket.io/stable/socket.io.js"></script>
<script>
let socket = io('http://127.0.0.1:3000');

let interval = setTimeInterval(()=>{
  socket.emit('random', Math.random());
}, 500);

socket.on('warn', count=>{
  console.log('warning count : '+count);
});

socket.on('disconnect', ()=>{
  clearInterval(interval);
});
</script>
```

```
/*服务端*/
let httpServer = require('http').Server();
let io = require('socket.io')(httpServer);
httpServer.listen(3000);

io.on('connection', socket=>{
  socket.on('random', value=>{
    console.log(value);
    if(value>0.95){
      if(typeof socket.warnign==='undefined'){
        socket.warning = 0;// socket对象可用来存储状态和自定义数据
      }
      setTimeout(()=>{
        socket.emit('warn', ++socket.warning);
      }, 1000);
    }
  });
});
```




