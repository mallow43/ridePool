require('dotenv').config()

var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/users"),
    middleware = require("../middleware/middleware"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    mongoose = require("mongoose")

var NodeGeocoder = require('node-geocoder');
 
    var options = {
      provider: 'google',
      httpAdapter: 'https',
      apiKey: process.env.GEOCODER_API_KEY,
      formatter: null
    };
    var geocoder = NodeGeocoder(options);

router.get("/register", function(req, res){
    res.render("register.ejs")
})
passport.use(new LocalStrategy(User.authenticate()));
router.post("/register", function(req, res){
    geocoder.geocode(req.body.address, function (err, data) {
        if(err){
            console.log(err)
            
            req.flash("error", "Invalid Address")
            return res.redirect("back")
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        User.register(new User({username: req.body.username, lat: lat, lng: lng, phoneNumber: req.body.tel, email: req.body.email, address: location, firstName: req.body.firstName, lastName: req.body.lastName}), req.body.password, function(err, user){
            if(err){
                req.flash("error", err.message)
                res.render("register.ejs")
            }
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to the Post Oak Carpooling App")
                res.redirect("/home")

            })

        })
    })
})
router.get("/user/:id", function(req, res){
    req.params.id = String(req.params.id)
    req.params.id = mongoose.Types.ObjectId(req.params.id)
    User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err)
            req.flash("error", "User does not exist.")
            res.redirect("back")
        }else{
            res.render("profile.ejs",{user:user})

        }
    })
})
router.get("/login", function(req, res){
    res.render("login.ejs")
})
router.post('/login', 
  passport.authenticate('local', { 
      failureRedirect: '/login',
      failureFlash: true
     }),
  function(req, res) {
    req.flash("success", "Logged In Successfully")
 
    res.redirect('/home');
  });


router.get("/logout", function(req, res){
    req.logout()
    req.flash("success", "Logged Out Successfully")

    res.redirect("/home")
})
module.exports = router