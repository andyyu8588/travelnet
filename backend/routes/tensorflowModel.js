const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')
const path = require('path')

const router = express.Router()

router.get('/:param', (req, res, next) => {
  console.log(req.params)
  if (req.params) {
    res.status(200).sendFile(req.params.param, {root: path.resolve(__dirname, '..', 'Tf')})
  }
})

module.exports = router
