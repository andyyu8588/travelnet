const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')
const multer = require('multer')

// import model
const User = require('../models/User')
const post = require('../models/post')
const {use} = require('./posts')

const router = express.Router()

// setup multer storage
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname
        .toLowerCase()
        .split(' ')
        .join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  },
});

router.get('', jwtMiddleware, (req, res, next) => {
  const origin = jwt.decode(req.get('authorization'), jwtSecret)
  User.find({_id: origin.id}, (err, result) => {
    if (err) {
      res.status(500).json({
        message: err,
      })
    } else {
      res.status(200).json({
        user: result,
      })
    }
  })
})

/** edit user propertiess */
router.patch('/edit', (req, res, next) => {
  const key = req.body.params.proprety
  const val = req.body.params.newProprety
  const tempProprety = {}
  tempProprety[key] = val
  console.log(tempProprety)
  User.findOneAndUpdate({username: req.body.params.username}, {$set: tempProprety}, (err, doc, result) => {
    if (err) {
      console.log(err)
      res.status(500).json({
        message: err,
      })
    } else if (doc) {
      console.log(doc)
      res.status(200).json({
        message: `Success! ${req.body.proprety} changed to ${req.body.newProprety}`,
      })
    } else if (result) {
      res.status(500).json({
        message: 'monkas',
      })
    }
  })
})

/**follow user */
router.post('/follow', (req, res, next) => {
  User.findOneAndUpdate({username: req.body.username}, {$push: {following: req.body.followed}}, (err, result) => {
    if (err) {
      res.status(500).json({
        message: err,
      })
    } else if (result) {
      User.findOneAndUpdate({username: req.body.followed}, {$push: {followers: req.body.username}}, (err, result) => {
        if (err) {
          res.status(500).json({
            message: err,
          })
        } else if (result) {
          res.status(201).json({
            message: `Success!`,
          })
        } else {
          res.status(500).json({
            message: 'monkas',
          })
        }
      })
    } else {
      res.status(500).json({
        message: 'monkas',
      })
    }
  })
})

/**unfollow user */
router.post('/unfollow', (req, res, next) => {
  User.findOneAndUpdate({username: req.body.username}, {$pull: {following: req.body.unfollowed}}, (err, result) => {
    if (err) {
      res.status(500).json({
        message: err,
      })
    } else if (result) {
      User.findOneAndUpdate({username: req.body.unfollowed}, {$pull: {followers: req.body.username}}, (err, result) => {
        if (err) {
          res.status(500).json({
            message: err,
          })
        } else if (result) {
          res.status(201).json({
            message: `Success!`,
          })
        } else {
          res.status(500).json({
            message: 'monkas',
          })
        }
      })
    } else {
      res.status(500).json({
        message: 'monkas',
      })
    }
  })
})

/**add tag */
router.put('/addTag', (req, res, next) => {
  User.find({username: req.body.username}).then((user) => {
    if (user) {
      if (!user[0].tags.includes(req.body.tag)) {
        user[0].tags.push(req.body.tag)
      } else {
        user[0].tags.pop(req.body.username)
      }
      user[0].save()
      res.status(200).json({
        message: 'like added/removed',
        likes: user.tags,
      });
    }
  })
})

/**add profile picture */
router.put('/profilepicture', multer({storage: storage}).single('image'), (req, res, next) => {
  console.log(req)
  const url = req.protocol + '://' + req.get('host') + '/images/' + req.file.filename;
  User.findOneAndUpdate({username: req.body.username}, {profilepicture: url}, (err, result) => {
    if (err) {
      res.status(500).json({
        message: err,
      })
    } else if (result) {
      res.status(201).json({
        message: `Success! Profilepicture updated!`,
      })
    } else {
      res.status(500).json({
        message: 'monkas',
      })
    }
  })
})

module.exports = router
