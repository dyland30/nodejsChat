var app = require('express')();
var http = require('http').Server(app);
var io =require('socket.io')(http);
var path = require('path');

//rutas
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/chat-admin', function(req, res) {
  res.sendFile(path.join(__dirname + '/admin.html'));
});


var userCount=0;
var adminUser ={username:'admin',name:'',password:'1234'};
var adminLoged = null;
var users=[];

function broadcastUsers(){
  io.sockets.emit('userList',users);
}

io.on('connection',function(socket){


  console.log('usuario conectado');
/*
  setTimeout(function(){
    socket.send('Hola Que hace :v');
  },4000);

  setTimeout(function(){
    socket.emit('testEvent',{description:'otro evento por aqui :v'});
  },5000);

    socket.on('clientEvent',function(data){
        console.log(data);
    });
    //broadcast events
    io.sockets.emit('broadcast',{description:userCount+' clientes conectados'});
*/
//login chat
var userConected;

socket.on('loginAdmin',function(usr){
  if(usr.username==adminUser.username && usr.password==adminUser.password){
    adminLoged = usr;
    io.sockets.emit('adminConected',{username:usr.username, name:usr.name}); // broadcast
    userConected= usr.username;
    users.push(usr.username);
    broadcastUsers();
  }else{
    socket.emit('loginError','Usuario o clave incorrectos');
  }

});
//chat
socket.on('setUsername',function(data){
  userConected=data;
  if(users.indexOf(data)>-1){
    socket.emit('userExists', data+' el usuario ya ha sido utilizado');
  } else{
    userCount++;
    users.push(data);
    socket.emit('userSet',{username:data});
    broadcastUsers();
  }
});
socket.on('msg',function(data){
  //enviar mensaje a todos
  data.messageDate = new Date();
  io.sockets.emit('newmsg',data);
});


  socket.on('disconnect',function(){
    console.log('usuario desconectado');
    userCount--;
    var idx = users.indexOf(userConected);
    if(idx>-1){
      users.splice(idx,1);
    }
    io.sockets.emit('broadcast',{description:userCount+' clientes conectados'});
    broadcastUsers();
  });

});

http.listen(3000, function() {
   console.log('listening on *:3000');
});
