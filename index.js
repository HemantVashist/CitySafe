const express = require("express") //random Comment to change heroku 
const bodyParser = require("body-parser")
const cors = require("cors")
const Nexmo = require("nexmo")
const request = require('request')
var session = require('express-session');
var app = express()

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname+"/public"))
app.use(cors())

var apiDomain = "https://citysafeflaskapi.herokuapp.com"
var User = require("./models/User")

// var u1 = {
//   name: "Hemant",
//   coordinates_sos: {
//     latitude: undefined,
//     longitude: undefined
//   },
//   coordinates_gl: {
//     latitude: undefined,
//     longitude: undefined
//   }
// };

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
    ],
    "Road Hazard":[
      "Information1 to be added",
      "Information2 to be added"  
    ],
    
};

var phones = [918130116311,918130858595,918619247487]
// var phones = [918619247487]

const nexmo = new Nexmo({
  apiKey: 'd3171a29',
  apiSecret: 'supp7XbuvpuWq89X',
  applicationId: 'b2b51d05-84a0-4949-837b-8abccdf6c62d',
  privateKey: './private.key'
})

app.get('/',(req,res)=>{
  if(!req.session.u1){
    req.session.u1 = {
      name: "Hemant",
      coordinates_sos: {
        latitude: undefined,
        longitude: undefined
      },
      coordinates_gl: {
        latitude: undefined,
        longitude: undefined
      }
    };
  }
  var uri = apiDomain+`/coords/${req.session.u1.coordinates_gl.latitude}/${req.session.u1.coordinates_gl.longitude}`
  console.log(uri)

  if(req.session.u1.coordinates_gl.latitude && req.session.u1.coordinates_gl.longitude){
    request.get({
      url:uri,
      json:true,
      headers: {'User-Agent': 'request'}
    }, (err, response, data) => {
        if (err) {
          console.log('Error:', err);
        } else if (res.statusCode !== 200) {
          console.log('Status:', res.statusCode);
        } else {
          // data is already parsed as JSON:
          console.log(data);
          res.render("home",{data:data,guides:guidelines,found:true});     
        }
    });
  }else{
    res.render("home",{found:false});
  }
})

app.post("/",(req,res)=>{
  req.session.u1.coordinates_gl.latitude = req.body.coords.latitude
  req.session.u1.coordinates_gl.longitude = req.body.coords.longitude
  res.send({redirect: "/"})
})

app.get('/safe-map',(req,res)=>{

    res.render("safe-map");

})

app.get('/map',(req,res)=>{

  if(req.session.u1.coordinates_sos.latitude!=undefined && req.session.u1.coordinates_sos.longitude!=undefined){
    res.render("map",{user:req.session.u1})
  }else{
    res.send("Press SOS button before map view")
  }

})

app.get('/map_withcoords',(req,res)=>{
  var u1 = {
    name: "Hemant",
    coordinates_sos: {
      latitude: req.query.lat,
      longitude: req.query.lon
    },
    coordinates_gl: {
      latitude: undefined,
      longitude: undefined
    }
  };
  if(u1.coordinates_sos.latitude!=undefined && u1.coordinates_sos.longitude!=undefined){
    res.render("map",{user:u1})
  }else{
    res.send("Press SOS button before map view")
  }

})

app.post("/call",(req,res)=>{
  var phoneNumber = req.body.phoneNumber;
  var timer = req.body.timer;

  setTimeout(makeCall,timer*1000,phoneNumber)
  res.redirect("/")
})
app.post("/contact",(req,res)=>{

  //getting location coords from client
  req.session.u1.coordinates_sos.latitude = req.body.coords.latitude
  req.session.u1.coordinates_sos.longitude = req.body.coords.longitude
  console.log(req.session.u1.coordinates_sos.latitude)

  //SMS API
  var link = "https://citysafe-sih.herokuapp.com/map_withcoords?lon="+req.session.u1.coordinates_sos.longitude+"&lat="+req.session.u1.coordinates_sos.latitude
  console.log(link)
  var msg = `${req.session.u1.name} might be in danger. See more at ${link}`

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
  res.send({redirect: "/"})
})

app.get("/")

function makeCall(phoneNumber){
  const ncco = [
    {
      action: 'talk',
      voiceName: 'Kendra',
      text: 'Hi , How are you? This call will now disconnect',
    },
  ];
  nexmo.calls.create({
    to: [{ type: 'phone', number: phoneNumber }],
    from: { type: 'phone', number: '918619247487' },
    ncco,
  },(err, result) => {
      console.log(err || result);
    },
  );
}

port = process.env.PORT || 3000
app.listen(port,()=>{
  console.log(`App started at port ${port}`)
})
