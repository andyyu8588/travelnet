const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const userRoute = require('./routes/user')
const profileRoute = require('./routes/profile')
const searchUsersRoute = require('./routes/searchusers')
const app = express()

// setup cors
const corsOptions = {
  origin: false
}

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

// friends route authentication
app.use(cors(corsOptions))
app.use('/user', userRoute)
app.use('/profile', profileRoute)
app.use('/searchusers',searchUsersRoute)

// set database URL:
const dbURL = 'mongodb://heroku_ln0g37cv:cvo479sjkhpub1i2d9blgin18t@ds147304.mlab.com:47304/heroku_ln0g37cv'

// connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log('lit')
    }
  })

module.exports = app