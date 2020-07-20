const express = require("express");
const Post = require("../models/post");
const Comment = require("../models/post");
const router = express.Router();


/**creates new comment */
router.post(
    "/",
    (req,res,next) => {
    Post.findById(req.params.id).then(post => {
      if (post){
        const comment = new Comment({
          author: req.params.author,
          content: req.params.content,
          likes: [],
          replies: []
        })
        post.comments.push(comment)
        post.save().then(post => {
          res.status(201).json({
            message: "comment added successfully",
            comment: {
              id: post[post.comments.length-1].comment_id,
              author: req.params.author,
              content: req.params.content,
              likes: [],
              replies: []
            }
          })
        })
      }
      else(
        res.status(404).json({ message: "Post not found!" })
      )
    })
  })
  /**replies to existing comment */
  router.post(
  ":id",
  (req,res,next) => {
    Comments.findById(req.params.id).then(comment => {
      if (comment){
        const reply = new Comment({
          author: req.params.author,
          content: req.params.content,
          likes: [],
          replies: []
        })
        comment.replies.push(reply)
        comment.save().then(comment => {
          res.status(201).json({
            message: "reply added successfully",
            comment: {
              id: comment[comment.replies.length-1].comment_id,
              author: req.params.author,
              content: req.params.content,
              likes: [],
              replies: []
            }
          })
        })
      }
      else{
        res.status(404).json({ message: "Comment not found!" })
      }
    })
  })
  /**edits existing comment */
  router.put(
    "/:id",
    (req, res, next) => {
        const comment = new Comment({
          author: req.params.author,
          content: req.params.content,
          likes: req.params.likes,
          replies: req.params.replies
        })
      try{
        Comment.updateOne({ _id: req.params.id }, comment).then(result => {
          res.status(200).json({ 
              message: "Update successful!",
              comment: {
                id: result._id,
                author: req.params.author,
                content: req.params.content,
                likes: req.params.likes,
                replies: req.params.replies
              }
            },
          );
        });
      } catch (e){
        print(e)
      }
    }
  );
  /**likes existing comment */
  router.put("/like/:id",(req, res, next) => {
    Comment.findById(req.params.id).then(comment => {
      if (comment) {
        if(!comment.likes.includes(req.body.username)){
          comment.likes.push(req.body.username)
        }
        else{
          comment.likes.pop(req.body.username)
        }
        comment.save()
        res.status(200).json({
          message: "like added/removed" ,
          likes : comment.likes
        });
      }
      else{
        res.status(404).json({ message: "comment not found!" });
      }
    })
  })
  /**deletes existing comment */
router.delete("/:id", (req, res, next) => {
    Comment.deleteOne({ _id: req.params.id }).then(result => {
      console.log(result);
      res.status(200).json({ message: "Post deleted!" });
    });
  });
  
  
  module.exports = router;