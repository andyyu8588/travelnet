const express = require('express')
const router = express.Router()
// import model
const User = require("../models/User")
// needs fixing
router.get('', (req, res, next) => {

  let query = req.query.user

  User.aggregate([
    {
      $project: {
        "name": {
          $concat: [
            "$firstname",
            " ",
            "$lastname",
          ]
        },
      }
    },
    {
      $match: {
        "name": {
          $regex: `.*${query}.*`,
          $options: "i"
        }
      }
    }
    
  ])
  .exec((err,result) => {
    if (err) {
      res.status(500).json({
        message: err
      })
    }
    else {
      let resArr = []
      result.forEach((e) => {
        resArr.push(e)
      })
      res.status(200).json({
        users: resArr
      })
    }
  })
})

module.exports = router
