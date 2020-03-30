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

  socket.on('searchuser', (data) => {
    User.find({username: data}, (err, res) => {
        if (err) {
            console.log(err)
        } 
        else if (res.lenght === 0) {
            socket.emit('searchuser_res', 'does not exists')
        }
        else if (res.lenght === 1) {
            socket.emit("searchuser_res", res[0].username)
        }
        else {
            console.log('wtf searchuser')
        }
    })
  })

  //handle chatrooms & messages
  socket.on('CreateChatroom',(data)=>{
    

    Chatroom.find({Users:{$all:[data]}},(err,res)=>{
      if(err){
        console.log(err)
      }
      else if(res.length >= 1){
        console.log('chatroom exists', res)
        socket.emit('CreateChatroom_res',res)
      }
      else{
        User.find({username:data.user2}, (err, res)=>{
          
          if(err){
            console.log(err)
            socket.emit('CreateChatroom_res', 'error')
          }
          else if(res.length === 1){
            console.log(res[0].username)
            var newChatroom = new Chatroom({Users : [data.user1,data.user2], Messages : []})
            newChatroom.save()
            socket.emit('CreateChatroom_res',res[0].Messages)
          }
          else{
            console.log(res[0])
            socket.emit('CreateChatroom_res', 'error')
          }
      })
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