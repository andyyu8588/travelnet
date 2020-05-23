const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')

// import model
const User = require("../models/User")

const router = express.Router()

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
  tempProprety[proprety] = req.query.newProprety
  User.findOneAndUpdate({username: req.query.username}, {$set: tempProprety}, (err, doc, res) => {        
    if (err) {
      console.log('a')
      res.status(500).json({
        message: err
      })
    } else if (doc) {
      console.log('b')
      res.status(200).json({
        message: `Success! ${proprety} changed to ${newProprety}`
      })
    } else {
      console.log('c')
      res.status(500).json({
        message: 'monkas'
      })
    }
  })
})

module.exports = router