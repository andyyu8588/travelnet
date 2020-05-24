const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')
const multer = require('multer')

// import model
const User = require("../models/User")

const router = express.Router()

// setup multer storage
const MIME_TYPE_MAP = { 
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype]
    let error = new Error('Invalid mime type')
    if (isValid) {
      error = null
    }
    cb(error, 'backend/images')
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-')
    const ext = MIME_TYPE_MAP[file.mimetype]
    cb(null, name + '-' + Date.now() + '.' + ext)
  }
})

router.get('', jwtMiddleware, (req, res, next) => {
    let origin = jwt.decode(req.get('authorization'), jwtSecret)
    User.find({_id: origin.id}, (err, result) => {
      if (err) {
        res.status(500).json({
          message: err
        })
      } else {
        res.status(200).json({
          user: result
        })
      }
    })
})

router.post('/edit', (req, res, next) => {
  let origin = jwt.decode(req.get('authorization'), jwtSecret)
  let tempProprety = {}
  tempProprety[req.body.params.proprety] = req.body.params.newProprety
  User.findOneAndUpdate({username: req.body.params.username}, {$set: tempProprety}, (err, doc, result) => {        
    if (err) {
      res.status(500).json({
        message: err
      })
    } else if (doc) {
      res.status(200).json({
        message: `Success! ${req.body.params.proprety} changed to ${req.body.params.newProprety}`
      })
    } else {
      res.status(500).json({
        message: 'monkas'
      })
    }
  })
})

router.post('/profilepicture', multer({storage}).single('image'), (req, res, next) => {
  console.log('image received')
})

module.exports = router