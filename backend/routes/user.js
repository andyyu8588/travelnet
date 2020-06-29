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
    cb(error, '/')
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-')
    const ext = MIME_TYPE_MAP[file.mimetype]
    cb(null, name + '-' + Date.now() + '.' + ext)
  }
})

const upload = multer({
  storage: storage
}).single('image')

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

router.patch('/edit', (req, res, next) => {
  let key = req.body.params.proprety
  let val = req.body.params.newProprety
  let tempProprety = {}
  tempProprety[key] = val
  console.log(tempProprety)
  User.findOneAndUpdate({username: req.body.params.username}, {$set: tempProprety}, (err, doc, result) => {        
    if (err) {
      console.log(err)
      res.status(500).json({
        message: err
      })
    } else if (doc) {
      console.log(doc)
      res.status(200).json({
        message: `Success! ${req.body.proprety} changed to ${req.body.newProprety}`
      })
    } else if (result) {
      res.status(500).json({
        message: 'monkas'
      })
    }
  })
})

router.post('/encounter', (req, res, next) => {
  User.findOneAndUpdate({username: req.body.username}, {$push: {encounters: req.body.encounter}}, (err, result) => {
    if (err) {
      res.status(500).json({
        message: err
      })
    } else if (result) {
      res.status(201).json({
        message: `Success! Encounters updated!`
      })
    } else {
      res.status(500).json({
        message: 'monkas'
      })
    }
  })
})

router.post('/profilepicture', upload, (req, res, next) => {
  const url = req.protocol + '://' + req.get('host') + '/images/' + req.file.filename 
    User.findOneAndUpdate({username: req.body.username}, {profilepicture: url}, (err, result) => {
      if (err) {
        res.status(500).json({
          message: err
        })
      } else if (result) {
        res.status(201).json({
          message: `Success! Profilepicture updated!`
        })
      } else {
        res.status(500).json({
          message: 'monkas'
        })
      }
    })
})

module.exports = router