const express = require("express");
const Post = require("../models/post");
const Comment = require("../models/post");
const { response } = require("express");
const router = express.Router();
var mongoose = require('mongoose');


/**creates new comment */
router.post(
    "/",
    (req,res) => {
    Post.findById(req.body.postId).then(post => {
      if (post){
        const comment ={
          date: req.body.commentData.date,
          author: req.body.commentData.author,
          content: req.body.commentData.content,
          likes: [],
          replies: [],
          edited: []
        }
        post.comments.push(comment)
        post.save().then(post => {
          res.status(201).json({
            message: "comment added successfully",
            comment: {
              _id: post.comments[post.comments.length-1]._id,
              date: req.body.commentData.date,
              author: req.body.commentData.author,
              content: req.body.commentData.content,
              likes: [],
              replies: [],
              edited: []
            }
          })
        })
      }
      else(
        res.status(404).json({ message: "Post not found!" })
      )
    })
  })
  /**replies to tree comment */
  router.put(
    "/:id",
    (req,res) => {
    Post.findById(req.body.postId).then(post => {
      if (post){
        const reply ={
          date: req.body.commentData.date,
          author: req.body.commentData.author,
          content: req.body.commentData.content,
          likes: [],
          edited: []
        };
        (post.comments.id(req.params.id).replies).push(reply);
        post.save().then(post => {
          res.status(201).json({
            message: "reply added successfully",
            reply: {
              _id: post.comments.id(req.params.id).replies[post.comments.id(req.params.id).replies.length-1]._id,
              date: req.body.commentData.date,
              author: req.body.commentData.author,
              content: req.body.commentData.content,
              likes: [],
              edited: []
            }
          })
        }).catch((err) => console.log(err));
      }
      else{
        res.status(404).json({ message: "Comment not found!" })
      }
    }).catch( error => {
      console.log( `error ${error.message}` );
      console.log( error );
     } );
  })
  /**edits existing comment */
  router.put(
    "/edit/:id",
    (req, res, next) => {
      if(req.body.reply){
        var editedComment = {
          _id: req.body.reply._id,
          date: req.body.reply.date,
          author: req.body.reply.author,
          content: req.body.reply.content,
          likes: req.body.reply.likes,
          edited: req.body.reply.edited
        }
      }
      else{
        var editedComment = {
          _id: req.body.comment._id,
          date: req.body.comment.date,
          author: req.body.comment.author,
          content: req.body.comment.content,
          likes: req.body.comment.likes,
          replies: req.body.comment.replies,
          edited: req.body.comment.edited
        }
      }
      try{
        Post.findById(req.body.postId).then(post => {
          if (post) {
            if(req.body.reply){
              var array = post.comments.id(req.params.id).replies
              var comment = array.id(req.body.replyId)
              var index = array.indexOf(comment)
            }
            else{
              var array = post.comments
              var comment= array.id(req.params.id)
              var index = array.indexOf(comment)
            }
            array[index] = editedComment
            post.save().then(post =>{
              console.log(editedComment)
              res.status(200).json({ 
                message: "Update successful!",
                comment: editedComment
              });
            }).catch((err) =>console.log(err));
          }
        }).catch(err=>console.log(err));
      }catch (e){
        (e)
      }
    }
  );
  /**likes comment */

  router.put(
    "/like/:id",
    (req, res) => {
    Post.findById(req.body.postId).then(post => {
      if (post) {
        if(req.body.replyId){
          var comment= post.comments.id(req.params.id).replies.id(req.body.replyId)
        }
        else{
          var comment= post.comments.id(req.params.id)        
        }

        if(!comment.likes.includes(req.body.username)){
          comment.likes.push(req.body.username)
        }
        else{
          comment.likes.pop(req.body.username)
        }
        post.save().then(post =>{          
          res.status(201).json({
          message: "like added/removed" ,
          post: post,
          likes : comment.likes
          });
        }).catch((err) => next(err));
      }
      else {
      res.status(404).json({ message: "comment not found!" });
      }
    }).catch( error => {
      console.log( `error ${error.message}` );
      next( error );
     } );
  })



  /**get all comments associated to a post */
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post.comments);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

  /**deletes existing comment */
router.put("/delete/:id", (req, res, next) => {
  Post.findById(req.body.postId).then(post => {
    if (post){
      if(req.body.replyId){
        var comment= post.comments.id(req.params.id).replies.id(req.body.replyId)

      }
      else{
        var comment= post.comments.id(req.params.id)        
      }
      console.log(comment)
      comment.remove();
      post.save().then(result => {
        res.status(200).json({ message: "Post deleted!" });
      })
    }else {
      res.status(404).json({ message: "Post not found!" });
    }
  })
});
  
  
  module.exports = router;