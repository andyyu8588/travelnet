const http = require('http')
const app = require('./backend/app')

// setup http server (https in heroku tho)
const PORT = process.env.PORT || 3000
const server = http.createServer(app)

// setup socket.io
const io = require('socket.io').listen(server)
const socket = require('./backend/socket/socket.js')
socket(io)

// open server
server.listen(PORT, () => {
  console.log('Server started on port ' + PORT)
})