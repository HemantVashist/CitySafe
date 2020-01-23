var express=require('express');
var app=express(); 
var request = require("request");
var ejs=require('ejs');


var options = {
    url: "http://localhost:5000/coords/25.7056/76.37839",
    method: "GET"
}

request(options,(err, res, body)=>{
    let data = JSON.parse(body)
    console.log(data['Name of district'])
})


app.listen(3000,function(){
	console.log("Server Started");
})