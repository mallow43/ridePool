var mongoose = require("mongoose")

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    address: String,
    lat: Number,
    lng: Number,
})
userSchema.plugin(passportLocalMongoose)
var User = mongoose.model("User", userSchema)
module.exports = User