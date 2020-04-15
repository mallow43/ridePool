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
            res.render("register.ejs")
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/blogs")

        })
        
    })
})
router.get("/login", function(req, res){
    res.render("login.ejs")
})
router.post('/blogs/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/blogs');
  });


router.get("/logout", function(req, res){
    req.logout()
    res.redirect("/blogs")
})
module.exports = router