var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/users"),
    middleware = require("../middleware/middleware"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Drive = require("../models/drive.js"),
    Calendar = require("../models/calendar.js")
var NodeGeocoder = require('node-geocoder');
var distance = require('google-distance-matrix');
var newDate = require('new-date');
var request = require("request"),
    Pending = require("../models/pendingRiders.js")
    Rider = require("../models/riders.js")
var nodemailer = require('nodemailer');


distance.key(process.env.GEOCODER_API_KEY)
distance.traffic_model('best_guess');
distance.units('imperial');

 
    var options = {
      provider: 'google',
      httpAdapter: 'https',
      apiKey: process.env.GEOCODER_API_KEY,
      formatter: null
    };
    var geocoder = NodeGeocoder(options);
router.get("/home", middleware.isLoggedIn, function(req, res){
    Calendar.find({}).populate("drive").exec(function(err, calendar){
        console.log(calendar)
        res.render("home.ejs", {calendar:calendar})


    })
})
router.get("/", middleware.isLoggedIn, function(req, res){
    res.redirect("/home")
})
router.get("/calendar/new", middleware.isLoggedIn, function(req, res){
    res.render("newDrive.ejs")
})
router.post("/calendar/new", middleware.isLoggedIn,function (req, res){
    var formattedCampus;
    if(req.body.startLoc == "Other"){
        req.body.startLoc = req.body.startLocation
    }
    geocoder.geocode(req.body.startLoc, function (err, data) {
        console.log(err)
        if(req.body.campus == "Outside of School Event"){
            
            req.body.campus = req.body.destination
            formattedCampus = req.body.campus.substr(0, req.body.campus.indexOf(","))
            formattedCampus = formattedCampus.substr(0, req.body.campus.indexOf(","))
        }
        if(req.body.campus == "1010 Autrey St, Houston, TX 77006, USA"){
            formattedCampus = "Museum District Campus"
        }
        if(req.body.campus == "4600 Bissonnet St, Bellaire, TX 77401"){
            formattedCampus = "Bissonet Campus"
        }
        geocoder.geocode(req.body.campus, function (err, data1) {
            if(err){
                console.log(err)
            }else{
                var year = req.body.date.substr(0, 4),
                    month = Number(req.body.date.substring(5, 7)) - 1,
                    day = req.body.date.substr(8),
                    hour =req.body.startTime.substr(0,2),
                    minute = req.body.startTime.substr(3)

                var officialTime = new Date(year, month, day, hour, minute).getTime()/1000
                var lat = data[0].latitude
                var location = data[0].formattedAddress
                var lng = data[0].longitude
                var lat1 = data1[0].latitude
                var lng1 = data1[0].longitude
                var location1 = data1[0].formattedAddress
                var origins = [location];
                var destinations = [location1];

                var url = "https://maps.googleapis.com/maps/api/directions/json?origin="+lat+","+lng+"&destination="+lat1+"," +lng1+"&departure_time="+officialTime+"&key="+process.env.GEOCODER_API_KEY
                request(url, function(error, response, body){
                    console.log(error)    
                    if(!error && response.statusCode == 200){
                        
                        var data = JSON.parse(body)
                        console.log(data)
                        console.log(body)
                        var totalDistance = 0;
                        var totalDuration = 0;
                        var legs = data.routes[0].legs;
                        for(var i=0; i<legs.length; ++i) {
                            totalDistance += legs[i].distance.value;
                            totalDuration += legs[i].duration.value;
                        }
                        console.log(legs)
                        console.log(data)
                        console.log(totalDuration)
                        console.log(totalDistance)
                        var drive = new Drive({
                               departure: {
                                   lat:lat,
                                   lng: lng,
                                   location: location
                               },
                               driveDistance: {
                                   duration: totalDuration,
                                   distance: totalDistance,
                               },
                               destination: {
                                   lat:lat1,
                                   lng: lng1,
                                   location: location1
                               },
                               driver:{
                                   id: req.user._id,
                                   firstName: req.user.firstName,
                                   lastName: req.user.lastName,
                               },
                               maxRiders: req.body.maxRiders,
                               campus: formattedCampus,
        
                        })
                        Drive.create(drive, function(err, drive){
                            if(err){
                                console.log(err),
                                req.flash("error", "Error adding drive.")
                                res.redirect("back")
                            }else{
                            officialTime = new Date(year, month, day, hour, minute)
                            console.log(officialTime)
                            var calendar = new Calendar({
                                startTime: req.body.startTime,
                                drive: drive._id,
                                date: req.body.date,
                                officialTime: officialTime

                            })
                            Calendar.create(calendar, function(err, calendar){
                                if(err){
                                    console.log(err)
                                    req.flash("error", "Error Adding Drive to Calendar")
                                    res.redirect("back")
                                }else{
                                    req.flash("success", "Added Successfully")
                                    res.redirect('/home')
                                }
                            })
                    }
                })


                    }
                })
                }
                // })
                })
            })
        })
    
    router.get("/calendar/:id", middleware.isLoggedIn, function(req, res){
        Calendar.findById(req.params.id).populate("drive").populate("riders").populate("pendingRiders").exec(function(err, event){
            if(err){
                console.log(err)
                res.redirect("/home")
            }else{
                if(event){
                    res.render("show.ejs", {event: event})
                }else{
                    req.flash("error", "Event No Longer Exists")
                    res.redirect("/home")
                }

            }
        })
    })
    router.get("/calendar/:id/join", middleware.isLoggedIn,function(req, res){
        Calendar.findById(req.params.id).populate("drive").populate("riders").exec(function(err, event){
            if(err){
                console.log(err)
            }else{
                console.log(event._id)

                res.render("join.ejs", {event: event})

            }
        })
    })
    router.post("/calendar/:id/join", middleware.isLoggedIn,function(req, res){
        var pick;
        if(req.body.campus == "Other"){
            pick = req.body.pickUp
        }else{
            pick = req.body.campus
        }
        var rider = new Pending({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            pickUpLocation: pick,
            distance: req.body.newDistance,
            duration: req.body.newDuration,
            userId: req.user._id

        })
        console.log("===========")
        console.log(rider)
        Calendar.findById(req.params.id).populate("drive").exec(function(err, event){
            if(err){
                console.log(err)
                req.flash("error", "Error adding you to the drive please try again later.")
                res.redirect("/calendar/"+req.params.id)
            }else{
            Drive.findById(event.drive._id, function(err, drive){
                Pending.create(rider, function(err, rider){

                    if(err){
                        console.log(err)
                        req.flash("error", "Error adding you to the drive please try again later.")
                        res.redirect("/calendar/"+req.params.id)
                    }else{
                        console.log("===========")
                        console.log(rider)
                        event.pendingRiders.push(rider._id)
                        event.save()
                        req.flash("success", "Added Successfully, We will let you know when the driver approves your joining.")
                        res.redirect("/calendar/"+req.params.id)
                    }
                })
            
            })
        }
    })

})
router.get("/calendar/:id/:rider_id/decline", middleware.isLoggedIn, function(req, res){
    Calendar.findById(req.params.id).populate("drive").exec(function(err, event){
        Pending.findByIdAndRemove(req.params.rider_id, function(err, rider){
            User.findById(rider.userId, function(err, user){
                if(err){
                    console.log(err)
                    req.flash("error", "Error declining this user try again later.")
                }else{
                    user.notifications.push({
                        title:"Request Declined",
                        text: "Sorry your request to join " + event.drive.driver.firstName + " "+ event.drive.driver.lastName + "'s ride was declined."
                    })
                    user.save()
                    console.log(user)
                    console.log(rider)
                    req.flash("success", "Rejected!")
                    res.redirect("back")
                }
            })

        })
    })
})
router.get("/calendar/:id/:rider_id/accept", middleware.isLoggedIn, function(req, res){
    Calendar.findById(req.params.id).populate("drive").exec(function(err, event){
        if(err){
            console.log(err)
        }
        Drive.findById(event.drive._id, function(err, drive){
            if(err){
                console.log(err)
                req.flash("error", "error")
            }else{
                Pending.findByIdAndRemove(req.params.rider_id, function(err, rider){

                    if(err){
                        console.log(err)
                        req.flash("error", "Error accepting this user try again later.")
                        res.redirect("back")
                    }else{
                        console.log("=====")
                        console.log(rider)
                        var rid = {
                            firstName: rider.firstName,
                            lastName: rider.lastName,
                            pickUpLocation: rider.pickUpLocation,
                            distance: rider.distance,
                            duration: rider.duration,
                            userId: rider.userId
                        }
                        Rider.create(rid, function(err, rider2){
                            if(err){
                                console.log(err)
                                req.flash("error", "Error accepting this user try again later.")
                                res.redirect("back")
                            }else{
                                req.user.notifications.push({
                                    title:"Request Accepted",
                                    text: "Get ready for your carpool with " + drive.driver.firstName + " "+ drive.driver.lastName,
                                    drive: drive._id,
                                    event: event._id
                                })
                                req.user.save()
                                console.log(drive)
                                drive.driveDistance.duration = Number(drive.driveDistance.duration) + Number(rider.duration)
                                drive.driveDistance.distance = Number(drive.driveDistance.distance) + Number(rider.distance)
                                console.log(drive)
                                drive.save()
                                console.log(drive)
                                event.riders.push(rider2._id)
                                event.save()
                                req.flash("success", "Accepted!")
                                res.redirect("back")
                            }
                        })
                    }
                })
            }
        })

    })
})
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'carpooler48482@gmail.com',
      pass: process.env.EMAIL_PASSCODE
    }
  });
router.get("/calendar/:id/mail", middleware.isLoggedIn,function(req, res){
    Calendar.findById(req.params.id).populate("drive").populate("riders").exec(function(err, event){
        var url1 = "https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(event.drive.departure.location)
  
        url1 += "&waypoints="
        event.riders.forEach(function(rider){
          url1+= encodeURIComponent(rider.pickUpLocation)+"|"
        })
        url1 += "&destination="+ event.drive.destination.location
        var mailOptions = {
            from: 'carpooler48482@gmail.com',
            to: req.user.email,
            subject: 'Carpool To '+ event.drive.campus,
            html:"<!DOCTYPE html><head><link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css'><style>.ui.button.black{color: #2185d0;margin-top: 10px;}h1{color:#2185d0}</style></head><body><div class='ui container'><h1><i class='code icon'></i>ridePool</h1><br><a href= '"+url1+"'class='ui button black' style='text-align: center;'>Begin Rout in Google Maps</a></div></body></html>"
        }
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                req.flash("error", "Error Sending Email")
                res.redirect("back")
            } else {
                console.log('Email sent: ' + info.response);
                req.flash("success", "Email Sent Successfully")
                res.redirect("back")
            }
        });
    })
})

module.exports = router