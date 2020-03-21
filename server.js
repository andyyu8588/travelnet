const express = require('express')
const http = require('http')
const path = require('path')
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

//to send production folder of angular project

app.use(express.static(__dirname + '/frontend/dist/frontend/'))

app.get('/*', (req, res)=>{
  res.sendFile(path.join(__dirname))
})

server.listen(PORT, () => {
    console.log(`Server started! on port ${PORT}`)
  })


