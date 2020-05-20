const mongoose = require('mongoose')

const ChatroomSchema = mongoose.Schema({
    roomName: String,
    userNum: Number,
    Users: Array, // sorted alphabetically
    messages: [
      {content: String,
      sender: String,
      time: String,
      seen: Array
      }]
})

module.exports = mongoose.model('Chatroom', ChatroomSchema)