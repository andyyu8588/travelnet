const express = require('express')
const cookieParser = require('cookie-parser')
const http = require('http')
const path = require('path')
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose');
var onlineusers = []
var tempusers = []



//   constructor(username, password, email , rooms){
//     this.username = username
//     this.password = password
//     this.rooms = rooms
//     this.email = email
//   }
// }

//set URL:
const dbURL = 'mongodb://localhost/Chatroom'

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

app.use(cookieParser())

// env.PORT be useless tho
server.listen(3000, () => {
  console.log('Server started on port ' + PORT)
  })

//send homepage
app.get('/', (req, res)=>{
  res.sendFile((__dirname + '/Homepage.html'))
  res.cookie('test', 'ofcookie', {"expire": Date.now() + 300 , "domain":'http://localhost:3000/'})
})

//redirect to any page (scripts)
app.get('/*', (req, res)=>{
  page = req.params
  console.log(req.params)
  res.sendFile(__dirname + '/' + page[0])
})

io.on('connection', (socket) => {

  //assign room to client
  socket.on('join_room', (room) => {
    socket.join(room.room)
    socket.username = room.user
    //var Chatroom = new Chatroom({users:{},messages:{}})
    console.log(`${room.user} connected to: ${room.room}`)
    
  //listen to & send message of client
  socket.on('message', (data)=>{
    //var Msg =({name:data.name ,message: data.msg})
    // Msg.save()
    socket.to(room).emit('message', data)
  })
  })

  socket.on('createUser', (data)=>{
    console.log('creatuser connected')
    var newuser = new User({username : data.username, password: data.password, email : data.email, rooms: data.rooms})
    newuser.save()
    Chatroom.find(newuser)
    //tempusers.push(newuser)
    //console.log(data)
  })

  //manage disconnections
  socket.on('disconnect', ()=>{
    onlineusers.splice(onlineusers.indexOf(socket.username),1)
    console.log(`${socket.username} disconnected, ${onlineusers.length} online`)
  })
})