var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware/middleware"),
    User = require("../models/users"),
    Blogs = require("../models/blogs")

router.get("/blogs/:id", function(req, res){

    Blogs.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
        if(err){
            console.log(err)
        }else{
            res.render("show.ejs", {blog: foundBlog})
        }
    })
})
router.get("/", function(req, res){
    res.render("home.ejs")
})
router.get("/blogs", function(req, res){
    Blogs.find({}, function(err, blogs){
        if(err){
            console.log(err)
        }else{
            res.render("blogs.ejs", {blogs:blogs})
        }
    })
})
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("form.ejs")
})
router.post("/blogs/new", middleware.isLoggedIn,function(req, res){
    var title = req.body.title
    var image = req.body.image
    var body = req.body.body
    Blogs.create({
        title:title,
        image: image,
        body: body,
        author:{
            username: req.user.username,
            id: req.user.id
        }

    }, function(err, blog){
        if(err){
            console.log(err)
        }else{
            res.redirect("/blogs")
        }
    })
})

router.get("/blogs/:id", function(req, res){

    Blogs.findById(req.params.id).populate("comments").exec(function(err, blog){
        
        if(err){
            console.log(err)
        }else{
            
            res.render("show.ejs", {blog: blog})
            
        }
    })
})
router.get("/blogs/:id/edit", middleware.blogOwnership, function(req, res){
    Blogs.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err)
        }else{
            res.render("edit.ejs",{blog:blog})
            
        }
    })
})
router.put("/blogs/:id", middleware.blogOwnership,function(req,res){

    Blogs.findByIdAndUpdate(req.params.id, req.body, {new: true},function(err, newBlog){
        if(err){
            console.log(err)
            res.redirect("/blogs")

        }else{
            console.log(newBlog)
            console.log(req.body.blog)

            res.redirect("/blogs/"+req.params.id)
            
            
        }
    })
})

router.delete("/blogs/:id", middleware.blogOwnership,function(req, res){
    Blogs.remove({_id: req.params.id}, function(err, blog){
        if(err){
            console.log(err)
        }else{
            res.redirect("/blogs")
        }
    })
})
module.exports = router