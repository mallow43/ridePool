var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/users"),
    middleware = require("../middleware/middleware"),
    Comment = require("../models/comments"),
    Blogs = require("../models/blogs"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose") //blog Routs

router.get("/blogs/:id/comments/new", middleware.isLoggedIn,function(req, res){
    Blogs.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err)
            res.redirect("/blogs")
        }else{
            res.render("commentForm.ejs", {blog:blog})

        }
    })
})
router.post("/blogs/:id/comments/new", middleware.isLoggedIn,function(req, res){
    Blogs.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err)
            res.redirect("/")
        }else{
            var com = new Comment({
                author:{
                    id:req.user._id,
                    username: req.user.username
                },
                text: req.body.text
            })
            Comment.create(com, function(err, comment){
                if(err){
                    console.log(err),
                    res.redirect(back)
                }else{
                    blog.comments.push(comment)
                    blog.save()
                    req.flash("success", "Comment Created!")
                    res.redirect("/blogs/"+req.params.id)
                }
            })

        }
    })
    
})
router.get("/blogs/:id/comments/:comment_id/edit", middleware.commentOwnership,function(req, res){
    Comment.findById(req.params.comment_id, function(err, comment){
        if(err){
            res.redirect("back")
            console.log(err)
        }else{
            res.render("commentEdit.ejs", {comment: comment, blog_id: req.params.id})
        }
    })
})
router.put("/blogs/:id/comments/:comment_id/", middleware.commentOwnership,function(req, res){
    var com123 = {
        text: req.body.text
    }
    var updatedCom = {
        text: req.body.text
    }
    Comment.findByIdAndUpdate(req.params.comment_id, updatedCom,function(err, comment){
        if(err){
            console.log(err)
            res.redirect("/blogs"+req.params.id)
        }else{
            res.redirect("/blogs"+req.params.id)
        }
    })
})
router.get("/blogs/:id/comments/:comment_id/delete", middleware.commentOwnership,function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, comment){
        if(err){
            console.log(err)
            res.redirect("/blogs/"+req.params.id)
        }else{
            res.redirect("/blogs/"+req.params.id)

        }
    })
})
module.exports = router