const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const PORT = process.env.PORT || 3000
var connected = []

// PORT be useless tho
server.listen(3000, () => {
    console.log(`Server started on port ${PORT}`)
  })

app.get('/', (req, res)=>{
  res.sendFile((__dirname + '/index.html'))

})

app.get('/client-socket.js', (req, res)=>{
  res.sendFile(__dirname + '/client-socket.js')
})

io.on('connection', socket =>{
    socket.emit('message', 'chatroom online')
    connected.push(socket)
    console.log(`connected, ${connected.length} online`)

    socket.on('disconnect', ()=>{
      connected.splice(connected.indexOf(socket), 1)
      console.log(`disconnected, ${connected.length} online`)
    })

    socket.on('chatmessage', (data)=>{
      console.log(`message received: ${data}`)
      socket.broadcast.emit('chatmessage', (data))
    })
  })
