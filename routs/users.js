var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/users"),
    Blogs = require("../models/blogs"),
    middleware = require("../middleware/middleware"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")


router.get("/register", function(req, res){
    res.render("register.ejs")
})
passport.use(new LocalStrategy(User.authenticate()));
router.post("/blogs/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message)
            res.render("register.ejs")
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to BlogSite")
            res.redirect("/blogs")

        })
        
    })
})
router.get("/login", function(req, res){
    res.render("login.ejs")
})
router.post('/blogs/login', 
  passport.authenticate('local', { 
      failureRedirect: '/login',
      failureFlash: true
     }),
  function(req, res) {
    req.flash("success", "Logged In Successfully")
 
    res.redirect('/blogs');
  });


router.get("/logout", function(req, res){
    req.logout()
    req.flash("success", "Logged Out Successfully")

    res.redirect("/blogs")
})
module.exports = router