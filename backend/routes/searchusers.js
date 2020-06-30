const express = require('express')
const router = express.Router()
// import model
const User = require('../models/User');
// adds plugin to model


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router
router.get('/', (req, res) => {
  if(req.query.user){
    const regex = new RegExp(escapeRegex(req.query.user), 'gi');
    User.find({username: regex})
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
  }
})

