var express = require('express');
var app = express();
var http = require('http').Server(app);
var io =require('socket.io')(http);
var path = require('path');
var mensajeCtrl = require('./app/MensajeController.js');

// configure dotenv
//require('dotenv').config();

app.set('view engine', 'ejs');

app.set('views', __dirname + '/public/views');
//javascript files
/*
app.get('/client.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/js/client.js'));
});
app.get('/admin.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/js/admin.js'));
});
*/
 app.use('/js', express.static(__dirname + '/public/js'));
 app.use('/css', express.static(__dirname + '/public/css'));
//rutas
app.get('/', function(req, res) {
  res.render('index.ejs');
  mensajeCtrl.getAllMessages(function(messages){
    console.log("mensajes");
    console.log(messages);

  });
});
app.get('/chat-admin', function(req, res) {
  res.render('admin.ejs');
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
  //guardar mensaje en bd 
  
  mensajeCtrl.addMessage(data,function(){
    console.log("mensaje guardado en db ID:"+data.idMensaje);
  });
  
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

http.listen(8000, function() {
   console.log('listening on *:8000');
});
