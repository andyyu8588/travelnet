const fs = require('fs');
const https = require('https');

const express = require('express');
const app = express();

const options = {
  key: fs.readFileSync('./ssl/privateKey.key'),
  cert: fs.readFileSync('./ssl/certificate.crt'),
};
const serverPort = 443;

const server = https.createServer(options, app);
const io = require('socket.io')(server);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  console.log('new connection');
  socket.emit('message', 'This is a message from the dark side.');
});

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});
