const express = require('express')
const cookieParser = require('cookie')
const http = require('http')
const path = require('path')
const mongoose = require('mongoose')
const io = require('socket.io').listen(server)

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

var onlineusers = []

// set URL
var dbURL = 'mongodb://localhost/Travelnet'

// connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if (err) {
    console.log("Mongoose connection error")
  }
  else {
    console.log('lit')
  }
})

// create chatroom scheme
var Chatroom = mongoose.model('Chatroom', {
  Users : Array,  
  Messages : Array,
})

// create User scheme
var User = mongoose.model('User', {
    email : String,
    username : String,
    password : String,
    rooms : Array
})

// make server listen on port PORT
server.listen(3000, () => {
  console.log('Server started on port ' + PORT)
})

// send homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Welcome.html')
})

// redirect to any page (scripts)
app.get('/*', (req, res) => {
  page = req.params
  res.sendFile(__dirname + '/' + page[0])
})

io.on('connection', (socket) => {

  // assign room to client
  socket.on('join_room', (room) => {
    socket.join(room.room)
    socket.room = room.room
    console.log(`${room.user} connected to: ${room.room}`)
  })
    
  // listen to & send message of client
  socket.on('message', (data) => {
    socket.to(socket.room).emit('message', data)
  })
  
  // save new users in database
  socket.on('createUser', (data) => {
    console.log('create user resquest..')

    // check if username or email already exists & send answer to client
    User.find({email:data.email}, (err,res) => {
      if (err) {
        socket.emit('create_user_confirmation', 'error')
        console.log(err)
      }
      else if (res.length === 1) {
        socket.emit('create_user_confirmation', 'email is taken')
      }
      else {
        User.find({username:data.username}, (error, res1) => {
          if (error) {
            socket.emit('create_user_confirmation', 'error')
            console.log(error)
          }
          else if (res1.length === 1) {
            socket.emit('create_user_confirmation', 'username exists')
          }
          else if (res1.length === 0) {
            var newuser = new User({username : data.username, password: data.password, email : data.email, rooms: data.rooms})
            newuser.save()
            console.log(newuser)
            socket.emit('create_user_confirmation', 'ok')
          }
          else {
            console.log(res1.length)
            console.log('No server response for Username') // monkas
          }
        })
      }
    })
  })
  
  // handle user login
  socket.on('UserIn', (data) => {
    User.find({email:data.username, password:data.password}, (err, res) => {
      if (err) {
        socket.emit('UserIn', {ans: 'error', exp: 'email'})
      }
      else if (res.length === 1) {
        socket.emit('UserIn', {ans: 'ok', cookie: res.username})
      }
      else if (res.length === 0) {
        User.find({username:data.email, password:data.password}, (err, res) => {
          if (err) {
            socket.emit('UserIn', {ans:'error', exp: 'username'})
          }
          else if (res.length === 1) {
            socket.emit('UserIn', {ans: 'ok'})
          }
          else {
            console.log('No server response for Username') // monkas
          }
        })
      }
      else {
        console.log('No server response for Email') // monkas
      }
    })
  })


  // manage disconnections
  socket.on('disconnect', () => {
    onlineusers.splice(onlineusers.indexOf(socket.username), 1)
    console.log(`${socket.username} disconnected, ${onlineusers.length} online`)
  })
})