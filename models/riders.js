var mongoose = require("mongoose")
var riders = new mongoose.Schema({
    firstName: String,
    lastName: String,
    pickUpLocation: String,
    distance: String, 
    duration: String,
    userId: String

})
module.exports = mongoose.model("riders", riders)