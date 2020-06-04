const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')
const path = require('path')

const router = express.Router()

router.get('', (req, res, next) => {
    console.log(req.params)
    if (req) {
        res.status(200).sendFile(req.params, {root: '/app/backend/Tf'})
    }
})

module.exports = router