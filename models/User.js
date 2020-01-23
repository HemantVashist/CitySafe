var mongoose = require("mongoose")

var userSchema = new mongoose.Schema({
  name: String,
  phone: Number,
  coordinates:{
    latitude: Number,
    longitude: Number
  }
})

module.exports = mongoose.model("User",userSchema)