var socket = io();
var user;
var selectedUser;

var messages =[];

$(document).ready(function(){
  $("#frmUsuario").show();
  $("#message-zone").hide();
  user = sessionStorage.getItem('username');
  if(user){
    $("#frmUsuario").hide();
    $("#message-zone").show();
    //show saved messages

    //show saved users
    showUsers();
    showMessages();

  }

});

function showMessages(){
  messages = JSON.parse(sessionStorage.getItem("messages"));
  if(!messages){
    messages=[];
  }
  //show only messages from a selected user
  var htmlMessages = '';
  messages.forEach(function(data){
    if(data.user==selectedUser || (data.user==user && data.receptor==selectedUser)){
        htmlMessages += '<div><span style="font-size:small;color:gray"> ['+data.messageDate.toString()+'] </span>    <b>'+data.user+'</b>: '+data.message +'</div>';
    }

  });
  document.getElementById('message-container').innerHTML =htmlMessages;
  var objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;

};

function login(){
  var usr = {username:document.getElementById('username').value, name:document.getElementById('name').value,password:document.getElementById('password').value};

  socket.emit('loginAdmin',usr);
};

function selectUser(btn){
  //alert(btn.value);
  selectedUser = btn.value;
  if(selectedUser){
    document.getElementById('message-container-header').innerHTML='<b>'+selectedUser+'</b>';
    showMessages();
  }

}


socket.on('loginError',function(data){
  document.getElementById('error-container').innerHTML=data;
});

socket.on('adminConected',function(data){
  user = data.username;
  sessionStorage.setItem('username', data.username);
  sessionStorage.setItem('name',data.name);

  $("#message-zone").show();
  $("#frmUsuario").hide();

});

function sendMessage(){
  var msg=document.getElementById('txtMensaje').value;
  if(msg){
    socket.emit('msg',{message:msg,user:user,receptor:selectedUser});
    document.getElementById('txtMensaje').value='';

  }
};
function messageBtnKeyUp(evt){
  //alert(evt.keyCode);
  if(evt.keyCode==13){
    sendMessage();
  }

};
function showUsers(){
    var usersHtml ='';
  if(sessionStorage.getItem("activeUsers")){
      var users = JSON.parse(sessionStorage.getItem("activeUsers"));
      users.forEach(function(username){
          usersHtml+= '<button type="button" class="list-group-item" value="'+username+'" onclick="selectUser(this)">'+username+'</button>';
      });
      document.getElementById('user-list').innerHTML = usersHtml;
  }


};
socket.on('newmsg',function(data){
  if(user){
    messages.push(data);
    sessionStorage.setItem('messages',JSON.stringify(messages));
    showMessages();
  }
});

socket.on('userList',function(users){
  if(users){

    sessionStorage.setItem("activeUsers",JSON.stringify(users));
    showUsers();

  }
});
