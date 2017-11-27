
var Client = require('node-rest-client').Client;
var client = new Client();
require('dotenv').config();
var baseUrl = process.env.DB_API_BASE;

exports.getAllMessages = function(callback){
    client.get(baseUrl+"/mensajes", function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
       // console.log(response);
       var mensajes =[];
       if(data){
           
        data.Items.forEach(function(m){
            var msg = deserializeMessage(m);
            
            mensajes.push(msg);
        });
        if(callback){
            callback(mensajes);
        } 
       }else{
           callback(null);
       }
    });
};

exports.getMessagesByDate = function(strDate,callback){

    client.get(baseUrl+"/mensajes/getbydate/"+strDate, function (data, response) {
        // parsed response body as js object 
        console.log(data);
        // raw response 
       // console.log(response);
       var mensajes =[];
       if(data){
           
        data.Items.forEach(function(m){
            var msg = deserializeMessage(m);        
            mensajes.push(msg);
        });
        if(callback){
            callback(mensajes);
        } 
       }else{
           callback(null);
       }
    });
};

function deserializeMessage(m){
    var msg = {};
    if(m.user) msg.user = m.user.S;
    if(m.message) msg.message = m.message.S;
    if(m.idMensaje) msg.idMensaje=m.idMensaje.S;
    if(m.receptor) msg.receptor = m.receptor.S;
    if(m.messageDate) msg.messageDate = new Date(m.messageDate.S);
    if(m.year) msg.year = m.year.S;
    if(m.month) msg.month = m.month.S;
    if(m.day) msg.day = m.day.S;
    if(m.shortDate) msg.shortDate = m.shortDate.S;
    if(m.monthYear) msg.monthYear = m.monthYear.S;

    return msg;
}

exports.addMessage = function(msg, callback){
    if(msg){
        var rdm =  Math.round(Math.random() * (1000 - 1) + 1);
        
        msg.idMensaje = (new Date()).toISOString()+msg.user+rdm.toString();
        msg.day = (new Date()).getDate().toString();
        msg.month = ((new Date()).getMonth()+1).toString();
        msg.year = ((new Date())).getFullYear().toString();
        msg.shortDate = msg.year+"-"+msg.month+"-"+msg.day;
        msg.monthYear = msg.month+"-"+msg.year;

        var args = {data:JSON.stringify(msg)};
        client.post(baseUrl+"/mensajes/add",args,function(data,response){
           
            callback(msg);
        }); 
        
    }
    
};
