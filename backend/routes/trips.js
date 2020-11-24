const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')

// import model
const User = require('../models/User')

const router = express.Router()

router.get('', (req, res, next) => {
  const tripId = req.query.tripId
  if (tripId) {
    User.findOne({'trips._id': tripId}, (err, result) => {
      if (err) {
        res.status(500).json({
          message: err,
        })
      } else if (result) {
        for (let x = 0; x < result.trips.length; x++) {
          if (result.trips[x]._id == tripId) {
            if (!result.trips[x].isPrivate) {
              res.status(200).json({
                trip: result.trips[x],
              })
              break
            } else {
              res.status(202).json({
                err: 'this trip is private',
              })
              break
            }
          }
        }
      }
    })
  }
})

module.exports = router
