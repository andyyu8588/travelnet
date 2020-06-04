const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')
const path = require('path')

const router = express.Router()

router.get('', (req, res, next) => {
    console.log(req)
    if (req) {
        res.status(200).sendFile('model.json', {root: __dirname + '../Tf'})
    }
})

module.exports = router