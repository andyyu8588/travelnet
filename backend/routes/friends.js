const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('./backend/jwt.middleware')

// import model
const User = require("./backend/models/User")

const router = express.Router()

router.get('', jwtMiddleware, (req, res, next) => {
    let origin = jwt.decode(req.get('authorization'), jwtSecret)
    console.log(origin.id)
    User.find({_id: origin.id}, (err, result) => {
      if (err) {
        res.status(500).json({
          message: err
        })
      } else {
        res.status(200).json({
          friendlist: result
        })
      }
    })
})

module.exports = router