const express = require('express')
const jwt = require('jsonwebtoken')
const jwtSecret = 'MonkasczI69'
const jwtMiddleware = require('../jwt.middleware')

// import model
const User = require("../models/User")

const router = express.Router()