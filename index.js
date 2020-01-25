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

var u1 = {
  name: "Hemant",
  coordinates: {
    latitude: 28.6129362,
    longitude: 77.0358646
    // latitude: 28.5562,
    // longitude: 77.1000
  }
};

var guidelines = {
    "Assault on Women":[
      "Information1 to be added",
      "Information2 to be added"
    ],
    "Fraudulent Activity":[
      "Information1 to be added",
      "Information2 to be added"
    ],
    "Road Accidents":[
      "Information1 to be added",
      "Information2 to be added"
    ],
    "Murder":[
      "Always keep a tool for self-defence handy - like a pepper spray.",
      "Travel in groups. Avoid sparsely populated areas."
    ],
    "Negligence":[
      "Ensure anyone who provides any form of service to you is professionally certified."
    ],
    "Theft and Robbery":[
      "Call the national helpline at 112 if you see anyone suspicious following you.",
      "Travel in groups. Avoid sparsely populated areas."
    ],
    "Vehicle Theft":[
      "Ensure your car doors are locked at all times.",
      "Avoid travelling by inner city lanes and sparsely populated areas."
    ],
    "Criminal Trespassing":[
      "Do not open the doors/gates of your residence to visitors without prior notice.",
      "Ensure your residence has proper fencing to prevent trespassers."
    ],
    "Stalking":[
      "Call the national helpline 112 if you see anyone suspicious following you.",
      "Avoid staying out after dark."
    ]
};

// var phones = [918******595,918******487]
var phones = []

const nexmo = new Nexmo({
  apiKey: '<apikey>',
  apiSecret: '<apisecret>',
});

app.get('/',(req,res)=>{

  var uri = `http://localhost:5000/coords/${u1.coordinates.latitude}/${u1.coordinates.longitude}`

  // console.log(uri);

  request.get({
    url:uri,
    json:true,
    headers: {'User-Agent': 'request'}
  }, (err, re, data) => {
      if (err) {
        console.log('Error:', err);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
        // data is already parsed as JSON:
        // console.log(data);
        res.render("home",{data:data,guides:guidelines});     
      }
    });
})

app.post('/map',(req,res)=>{

  res.render("map",{user:u1})

})

app.post("/contact",(req,res)=>{

  //SMS API
  var link = "https://link.foruser.location"
  var msg = `${u1.name} might be in danger. See more at ${link}`

  phones.forEach((phone)=>{
    nexmo.message.sendSms("CitySafe",phone,msg,(err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        if(responseData.messages[0]['status'] === "0") {
          console.log("Message sent successfully.");
        } else {
          console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        }
      }
    })
  })
  res.redirect("/");
})

port = process.env.PORT || 8083
app.listen(port,()=>{
  console.log(`App started at port ${port}`)
})