const jwt = require('jsonwebtoken')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const mongoose = require('mongoose')
const friendsRoute = require('./backend/routes/friends')


// setup http server (https in heroku tho)
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const socket = require('./backend/socket/socket.js')
socket(io)

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
  next()
})

app.use('/friends', friendsRoute)

// connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log('lit')
  }
})