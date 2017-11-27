
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
            var msg = {}
            msg.user = m.user.S;
            msg.message = m.message.S;
            msg.idMensaje=m.idMensaje.S;
            msg.receptor = m.receptor.S;
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

exports.addMessage = function(msg, callback){
    if(msg){
        var rdm =  Math.round(Math.random() * (1000 - 1) + 1);
        
        msg.idMensaje = (new Date()).toISOString()+msg.user+rdm.toString();
        var args = {data:JSON.stringify(msg)};
        client.post(baseUrl+"/mensajes/add",args,function(dta,response){
            console.log(JSON.stringify(msg));
            callback();
        }); 
        
    }
    
};
