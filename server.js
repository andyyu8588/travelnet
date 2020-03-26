const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose');

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
// var Chatroom = mongoose.model('Chatroom',{
//   Users = Array,  
//   Messages = Array,
// })
//create message scheme

var Message = mongoose.model('Message',{
    name: String,
    message: String,
})


// env.PORT be useless tho
server.listen(3000, () => {
    console.log('Server started on port' + PORT)
  })

//send homepage
app.get('/', (req, res)=>{
  res.sendFile((__dirname + '/Homepage.html'))

})

//redirect to any page (scripts)
app.get('/*', (req, res)=>{
  page = req.params
  res.sendFile(__dirname + '/' + page[0])
})


io.on('connection', (socket) => {

  //assign room to client
  socket.on('join_room', (room) => {
    socket.join(room)
    console.log(`connected: `+ room)

    //listen to & send message of client
    socket.on('message', (data)=>{
      // var Msg = new Message({name:'bob',message: data})
      // Msg.save()
      socket.to(room).emit('message', data)
  })
  })


})