var mongoose = require("mongoose"),
    User = require("../models/users.js")

var calendar = new mongoose.Schema({
    
    startTime:String,
    drive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drive"
    },
    pendingRiders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "pendingRider"
        }
    ],
    riders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "riders"
        }
    ],
    date: String,
    officialStartTime: {type: Date}
    
})
module.exports = mongoose.model("Calendar", calendar)