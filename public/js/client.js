var socket = io();
var user;
var messages=[];

$(document).ready(function(){
  $("#frmUsuario").show();
  $("#frmMensaje").hide();
    user = sessionStorage.getItem('client-username');
    if(user){
      $("#frmUsuario").hide();
      $("#frmMensaje").show();
        //loguear nuevamente al usuario
      socket.emit('setUsername',user);
      showMessages();

    }

});

function showMessages(){
  messages = JSON.parse(sessionStorage.getItem("client-messages"));
  if(!messages){
    messages=[];
  }
  //show only messages from a selected user
  var htmlMessages = '';
  messages.forEach(function(data){
    htmlMessages += '<div><b>'+data.user+'</b>: '+data.message +'</div>';

  });
  document.getElementById('message-container').innerHTML =htmlMessages;

};

function setUsername(){
  socket.emit('setUsername',document.getElementById('nombre').value);
};
function messageBtnKeyUp(evt){
  //alert(evt.keyCode);
  if(evt.keyCode==13){
    sendMessage();
  }

};

socket.on('userExists',function(data){
  document.getElementById('error-container').innerHTML=data;
});

socket.on('userSet',function(data){
  user = data.username;
  sessionStorage.setItem('client-username', data.username);
  $("#frmMensaje").show();
  $("#frmUsuario").hide();
});
socket.on('adminConected',function(data){
  if(data){
    document.getElementById('message-container').innerHTML += '<div>El administrador <b>'+data.name+'</b>: se ha conectado.  </div>';
  }
});

function sendMessage(){
  var msg=document.getElementById('txtMensaje').value;
  if(msg){
    socket.emit('msg',{message:msg,user:user,receptor:'admin'});
    document.getElementById('txtMensaje').value='';
  }
};
socket.on('newmsg',function(data){
  if(user && (data.receptor==user || data.user==user)){
    messages.push(data);
    sessionStorage.setItem('client-messages',JSON.stringify(messages));
    showMessages();
  }
});
