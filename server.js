const express = require('express')
// const cookieParser = require('cookie-parser')
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
// app.use(cookieParser())

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
 
  //receive and send parsed cookie
  socket.on('cookie', data=>{
      socket.emit('cookieres', cookieParser.parse(data))
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
          if(error){    recipient.addEventListener('submit', (e)=>{
            e.preventDefault()
            console.log('select button clicked')
            socket.emit('CreateChatroom', userArray)
            userArray= []
        })    
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

  //handle chatrooms & messages
  socket.on('createChatroom',(data)=>{
    Chatroom.find({Users:{$all:data}},(err,res)=>{
      console.log(res)
      if(err){
        console.log(err)
      }
      else if(res.length >= 1){
        console.log('chatroom exists', res[0].Messages)
        socket.emit('createChatroom_res',res[0].Messages)
      }
      else{
          var newChatroom = new Chatroom({Users : data, Messages : [] })
          newChatroom.save()
          socket.emit('createChatroom_res',newChatroom.Messages)
          console.log(newChatroom,'Chatroom created')
          }
      //listen to & send message of client
      socket.on('message', (data)=>{
        res[0].Messages.push({
          sender: data.sender,
          time: Date.now() ,
          content: data.msg 
        })
        res[0].save();
        socket.emit('message', {msg: data.msg, sender: data.sender, time: Date.now()})
      })
    })
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

  //manage disconnections
  socket.on('disconnect', ()=>{
    onlineusers.splice(onlineusers.indexOf(socket.username),1)
    console.log(`${socket.username} disconnected, ${onlineusers.length} online`)
  })
})