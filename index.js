const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
var mongoose = require("mongoose")
const Nexmo = require("nexmo")
const request = require('request')
var app = express()
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname+"/public"))
app.use(cors())

const db = require("./config/keys").mongoURI;

mongoose
  .connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
  .then(()=>{console.log("MongoDB connected.")})
  .catch((err)=>{console.log(err)})

var User = require("./models/User")

const nexmo = new Nexmo({
  apiKey: 'd3171a29',
  apiSecret: 'supp7XbuvpuWq89X',
});

var u1 = {
    name: "Hemant",
    phone: 918619247487,
    coordinates: {
      latitude: 28.618254200000003,
      longitude: 77.04492139999999
    }
  };

app.get('/',(req,res)=>{
  res.render("home")
})



app.post('/map',(req,res)=>{

    res.render("map",{user:u1})

})


app.post("/contact",(req,res)=>{

  //SMS API
  var link = "https://link.foruser.location"
  var msg = `${u1.name} might be in danger. See more at ${link}`

  nexmo.message.sendSms("CitySafe",u1.phone,msg);

  res.redirect("/");

})




port = process.env.PORT || 8083
app.listen(port,()=>{
  console.log(`App started at port ${port}`)
})