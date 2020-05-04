var express = require("express"),
    flash = require("connect-flash")
var middleware = {}


middleware.isLoggedIn = function (req, res, next){
    if(req.user){
        next()
    }else{
        req.flash("error", "Please Log in First")
        res.redirect("/login")
    }
}
module.exports = middleware