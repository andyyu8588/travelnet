const mongoose = require('mongoose')

// import models
const User = require("./models/User")
const Chatroom = require("./models/Chatroom")

// create chatroom
// expects array of sorted usernames
const createChatroom = (usernames) => {
const newChatroom = new Chatroom({Users : usernames, roomName : usernames.toString(), messages : [], userNum: usernames.length })
newChatroom.save()
console.log('chatroom created with users ' + usernames)
usernames.forEach((user) => {
    User.findOneAndUpdate({username: user},
    {$push: {rooms: newChatroom._id.toString()}}, (err) => {
        if (err) {
        console.log(err)
        } else {
        console.log('room added to user')
        }
    }
    )      
})
}

module.exports = {createChatroom}