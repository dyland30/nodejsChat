var socket = io();
var user;
var messages=[];

$(document).ready(function(){
  $("#frmUsuario").show();
  $("#message-zone").hide();
    user = sessionStorage.getItem('client-username');
    if(user){
      $("#frmUsuario").hide();
      $("#message-zone").show();
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
    htmlMessages += '<div><span style="font-size:small;color:gray"> ['+data.messageDate.toString()+'] </span>    <b>'+data.user+'</b>: '+data.message +'</div>';

  });
  document.getElementById('message-container').innerHTML =htmlMessages;
  var objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;

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
function nombreKeyUp(evt){
  if(evt.keyCode==13){
    setUsername();
  }

}

socket.on('userExists',function(data){
  document.getElementById('error-container').innerHTML=data;
});

socket.on('userSet',function(data){
  user = data.username;
  sessionStorage.setItem('client-username', data.username);
  $("#message-zone").show();
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

    //alert(objDiv.scrollHeight);
  }
};
socket.on('newmsg',function(data){
  if(user && (data.receptor==user || data.user==user)){
    messages.push(data);
    sessionStorage.setItem('client-messages',JSON.stringify(messages));
    showMessages();
  }
});
