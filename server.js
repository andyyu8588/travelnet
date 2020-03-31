const express = require('express')
// const _ = require('underscore')
// for comparing array content regardless of order  
const cookieParser = require('cookie')
const http = require('http')
const path = require('path')
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose');
var onlineusers = []
const functionPage = require('./server2.js');

//set URL:
var dbURL = 'mongodb://localhost/Travelnet'

//connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true},(err) => {
  if(err){
    console.log(err)
  }
  else{
    console.log('lit')
  }
})

//create chatroom scheme
var Chatroom = mongoose.model('Chatroom',{
  Usernum : Number,
  Users : Array,  
  Messages : Array,
})

//create User scheme
var User = mongoose.model('User',{
    email : String,
    username : String,
    password : String,
    rooms : Array
})

// env.PORT be useless tho
server.listen(3000, () => {
  console.log('Server started on port ' + PORT)
  })

//send homepage
app.get('/', (req, res)=>{
  res.sendFile((__dirname + '/Welcome.html'))
})

//redirect to any page (scripts)
app.get('/*', (req, res)=>{
  page = req.params
  res.sendFile(__dirname + '/' + page[0])
})

io.on('connection', (socket) => {

  //handle join room & send back message history
  var joinRoom = (databaseobj, roomnum, message) => {
    socket.join(`${roomnum}`, ()=>{
      socket.room = roomnum
      socket.emit('createChatroom_res',message)
      console.log(`joined ${socket.room}`)
      messageHandler(databaseobj)
    })  
  }
 
  //handle live chat on first connect to chatroom
  var messageHandler = (databaseobj) => { 
    if(socket.room){
      console.log('message handler called')
      socket.on('message', (data) => {
        databaseobj.Messages.push({
          sender: data.sender,
          content: data.msg 
        })
        databaseobj.save();
        socket.emit('message_res', data)
        socket.in(`${socket.room}`).emit('message_res', data)
      })
    } else {
      console.log('message handler monkas')
    }
  }

  //receive and send parsed cookie
  socket.on('cookie', (data) => {
    let cookie = cookieParser.parse(data)
    socket.emit('cookieres', cookie)
    socket.username = cookie.username
  })

  //save new users in database
  socket.on('createUser', (data)=>{

    //check if username or email already exists & send answer to client
    User.find({email:data.email},(err,res)=>{
      if(err){
        socket.emit('create_user_confirmation', 'error')
        console.log(err)
      }
      else if(res.length === 1){
        socket.emit('create_user_confirmation', 'email is taken')
      }
      else {
        User.find({username:data.username}, (error, res1)=>{
          if(error){    
            socket.emit('create_user_confirmation', 'error')
            console.log(error)
          }
          else if(res1.length === 1){
            socket.emit('create_user_confirmation', 'username exists')
          }
          else if(res1.length === 0){
            var newuser = new User({username : data.username, password: data.password, email : data.email, rooms: data.rooms})
            newuser.save()
            socket.emit('create_user_confirmation', 'ok')
          }
          else{
            console.log('wtf happened')
          }
        })
      }
    })
  })

  socket.on('searchUser', (data) => {
    User.find({username: data}, (err, res) => {
        if (err) {
          console.log(err)
        } 
        else if (res.length === 0) {
          socket.emit('searchUser_res', 'does not exist')
        }
        else if (res.length === 1) {
          socket.emit("searchUser_res", res[0].username)
        }
        else {
          console.log('wtf searchUser')
        }
    })
  })

  //handle chatrooms & assign socket.join(room) w/ chatroom id as room
  socket.on('createChatroom',(data)=>{
    if(!socket.room){
      console.log(`chatroom req for ${data}`)
      Chatroom.find({Users: data, Usernum: data.length},(err,res)=>{
        if(err){
          console.log(err)
        }
        else if(res.length === 1){
          console.log('chatroom exists')
          joinRoom(res[0], res[0].id, res[0].Messages)
        }
        else {
          var newChatroom = new Chatroom({Users : data, Messages : [], Usernum: data.length })
          newChatroom.save((err, product) => {
            if (err) {
              console.log(err)
            }
            else {
              console.log('new chatroom created')
              joinRoom(product, product.id, product.Messages)
            }
          })
        }
      })
    } else {
      console.log(`client already in chat ${socket.room}`)
    }
  })

  //handle user login
  socket.on('UserIn', (data)=>{
    User.find({email:data.email}, (err, res)=>{
      if(err){
        socket.emit('UserIn_res', {ans: 'error', exp: 'email'})
      }
      else if(res.length === 1){
        socket.emit('UserIn_res', {ans: 'ok', cookie: res[0].username})
      }
      else if(res.length === 0){
        User.find({username:data.email, password:data.password}, (err, res)=>{
          if(err){
            socket.emit('UserIn_res', {ans:'error', exp: 'username'})
          }
          else if(res.length === 1){
            socket.emit('UserIn_res', {ans: 'ok', cookie: res[0].username})
          }
          else{
            console.log('monkas')
          }
        })
      }
      else{
        console.log('monkas')
      }
    })
  })

  // manage disconnections
  // socket.on('disconnect', ()=>{
  //   onlineusers.splice(onlineusers.indexOf(socket),1)
  //   console.log(`${socket.username} disconnected, ${onlineusers.length} online`)
  // })
})