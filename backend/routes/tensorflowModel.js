const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')
const path = require('path')

const router = express.Router()

router.get('', (req, res, next) => {
    console.log(req)
    if (req) {
        path.
        res.status(200).sendFile(path.join('backend', 'Tf', 'model.json'))
    }
})

module.exports = router