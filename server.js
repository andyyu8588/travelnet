const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const PORT = process.env.PORT || 3000
var connected = []

// env.PORT be useless tho
server.listen(3000, () => {
    console.log(`Server started on port ${PORT}`)
  })

app.get('/', (req, res)=>{
  res.sendFile((__dirname + '/index.html'))

})

app.get('/*', (req, res)=>{
  page = req.params
  console.log(page[0])
  res.sendFile(__dirname + `/${page[0]}`)
})


io.on('connection', socket =>{
    connected.push(socket)
    console.log(`connected, ${connected.length} online`)

    socket.on('disconnect', ()=>{
      connected.splice(connected.indexOf(socket), 1)
      console.log(`disconnected, ${connected.length} online`)
    })

    socket.on('chatmessage', (data)=>{
      console.log(`message received: ${data}`)
      socket.broadcast.emit('chatmessage', (data))
      // console.log(socket.id)
    })
  console.log(connected)
  })


 
  