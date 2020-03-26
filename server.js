const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const PORT = process.env.PORT || 3000

// env.PORT be useless tho
server.listen(3000, () => {
    console.log(`Server started on port ${PORT}`)
  })

//send homepage
app.get('/', (req, res)=>{
  res.sendFile((__dirname + '/index.html'))

})

//mainly to send required scripts to html pages 
app.get('/*', (req, res)=>{
  page = req.params
  console.log(page[0])
  res.sendFile(__dirname + `/${page[0]}`)
})


io.on('connection', (socket) => {

  //assign room to client
  socket.on('join_room', (room) => {
    socket.join(room)
    console.log(`user connected: `+ room)

    //listen to & send message of client
    socket.on('message', (data)=>{
      socket.to(room).emit('message', data)
  })
  })

})