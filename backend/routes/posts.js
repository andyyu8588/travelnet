const express = require("express");
const multer = require("multer");

const Post = require("../models/post");
const User = require("../models/User");

const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require("../jwt.middleware");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});
/**saves post to post collection, and saves post id to user */
router.post(
  "",
  multer({ storage: storage }).single("image"),
  jwtMiddleware,
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    let origin = jwt.decode(req.get('authorization'), jwtSecret)
    try{
      User.findById(origin.id).then(user =>{
        const post = new Post({
          date: req.body.date,
          location: req.body.location,
          author: req.body.author,
          // likes
          title: req.body.title,
          content: req.body.content,
          imagePath: url + "/images/" + req.file.filename,
          tags: req.body.tags
        });
        post.save().then(newPost => {
          console.log(newPost)
          res.status(201).json({
            message: "Post added successfully",
            post: {
              id: newPost._id,
              date: post.date,
              location: post.location,
              author: post.author,
              likes: [],
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              tags: post.tags
            }
          });
        });
        user.posts.push(post._id)
      })
    }catch(err){
      res.status(500).json({
      message: err})
      }
  }
);
/**edit existing post */
router.put(
  "/:id",
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
      _id: req.body.id,
      date: req.body.date,
      location: req.body.location,
      author: req.body.author,
      // likes
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      tags: req.body.tags
    });
    console.log(req.body)
    try{
      Post.updateOne({ _id: req.params.id }, post).then(result => {
        res.status(200).json({ message: "Update successful!" });
      });
    } catch (e){
      print(e)
    }
  }
);
/**like post through id */
router.put("/like/:id",(req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      if(!post.likes.includes(req.body.username)){
        post.likes.push(req.body.username)
      }
      else{
        post.likes.pop(req.body.username)
      }
      post.save()
      res.status(200).json({
        message: "like added/removed" ,
        likes : post.likes
      });
    }
    else{
      res.status(404).json({ message: "Post not found!" });
    }
  })
})
/**get all posts */
router.get("", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: documents
    });
  });
});
/**get specific post */
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

/**delete post */
router.delete("/:id", (req, res, next) => {
  
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  });
});

module.exports = router;