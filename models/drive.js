var mongoose = require("mongoose")
var drive = new mongoose.Schema({
    driveDistance: {
        duration: Number,
        distance: Number,
        
    },
    pendingRiders:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver"
        }
    },
    driver: {
            id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Driver"
            },
            firstName: String,
            lastName: String
    },
    maxRiders: Number,
    campus: String,
    destination:{
        location: String,
        lat: Number,
        lng: Number
    },
    departure:{
        location: String,
        lat: Number,
        lng: Number
    },
})
module.exports = mongoose.model("Drive", drive)