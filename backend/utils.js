// import models
const User = require('./models/User')
const Chatroom = require('./models/Chatroom')

// socket helper functions

// create chatroom
// expects array of sorted usernames
const createChatroom = (usernames) => {
  const newChatroom = new Chatroom({Users: usernames, roomName: usernames.toString(), messages: [], userNum: usernames.length})
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
        },
    )
  })
}

// check existence of one user and implement promises lmoa wtf
// expects string username
const searchUser = (username) => {
  return new Promise((resolve, reject) => {
    User.findOne({username}).exec((err, res) => {
      if (err) {
        reject(err)
      } else if (res) {
        resolve({res})
      } else {
        resolve('error')
      }
    })
  })
}

module.exports = {createChatroom, searchUser}
