const jwt = require('jsonwebtoken')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const path = require('path')
const mongoose = require('mongoose')
const jwtSecret = 'MonkasczI69'

const jwtMiddleware = require('./jwt.middleware')

// setup http server (https in heroku tho)
const PORT = process.env.PORT || 3000
const app = express()
const router = express.Router()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const socket = require('./backend/socket/socket.js')
socket(io)

// import helper function
const utils = require('./backend/utils')

// import models
const User = require("./backend/models/User")
const Chatroom = require("./backend/models/Chatroom")

// set database URL:
const dbURL = 'mongodb://heroku_ln0g37cv:cvo479sjkhpub1i2d9blgin18t@ds147304.mlab.com:47304/heroku_ln0g37cv'

// open server
server.listen(PORT, () => {
  console.log('Server started on port ' + PORT)
})

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// send homepage
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  )
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, GET, PUT")
  // res.sendFile(path.join(__dirname, 'frontend', 'dist', 'frontend', 'index.html'))
  next()
})

// allow static access to folder to get js
// app.use('/', express.static(path.join(__dirname, 'frontend', 'dist', 'frontend')))

app.get('/friends', jwtMiddleware, (req, res, next) => {
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
  // .then(result => {
  //   res.status(200).json({
  //     friendlist: result
  //   })
  // })
  // .catch(err => {
  //   res.status(500).json({
  //     message: err
  //   })
  // })
})

// connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log('lit')
  }
})

