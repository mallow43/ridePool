var express = require("express"),
    Blogs = require("../models/blogs"),
    flash = require("connect-flash")
var middleware = {}
middleware.blogOwnership = function(req, res, next){
    console.log(req.user)
    Blogs.findById(req.params.id, function(err, blog){
        if(err){
            res.redirect("back")
        }else{
            if(!req.user){
                req.flash("error", "Please Log in First")
                res.redirect("/login")
            }else{
                if(blog.author.id.equals(req.user._id)){
                    next()
                }else{

                    flash("error", "You are not authorized to make this change.")
                    res.redirect("/blogs/"+ blog._id)
                }
            }

        }

    })
}
middleware.commentOwnership = function(req, res, next){
    console.log(req.user)
    Comment.findById(req.params.comment_id, function(err, blog){
        if(err){
            res.redirect("back")
        }else{
            if(!req.user){
                req.flash("error", "Please Log in First")
                res.redirect("/login")
            }else{
                if(blog.author.id.equals(req.user._id)){
                    next()
                }else{
                    req.flash("error", "You are not authorized to make this change.")
                    res.redirect("/login")
                }
            }

        }

    })
}
middleware.isLoggedIn = function (req, res, next){
    if(req.user){
        next()
    }else{
        req.flash("error", "Please Log in First")
        res.redirect("/login")
    }
}
module.exports = middleware