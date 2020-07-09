const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const userRoute = require('./routes/user')
const profileRoute = require('./routes/profile')
const searchUsersRoute = require('./routes/searchusers')
const tripsRoute = require('./routes/trips')
const app = express()

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
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, GET, PUT, PATCH")
  next()
})

// friends route authentication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})
app.use('/user', userRoute)
app.use('/profile', profileRoute)
app.use('/searchusers',searchUsersRoute)
app.use('/trips', tripsRoute)

app.use('/', express.static(path.resolve(__dirname, '..', 'frontend', 'dist', 'frontend')))

app.use((req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'frontend', 'index.html'))
})


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