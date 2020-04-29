const express = require('express')
const https = require('https')
const http = require('http')
const fs = require('fs')
const app = express()
const PORT = 443
const mongoose = require('mongoose')
const currentTime = new Date().toISOString()

// setup https server
const server  = https.createServer({
  key: fs.readFileSync('./ssl/privateKey.key'),
  cert: fs.readFileSync('./ssl/certificate.crt')
}, app)

// const server  = http.createServer(app)

const io = require('socket.io')(server)

// set URL:
var dbURL = 'mongodb://localhost/Travelnet'

// connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log('lit')
  }
})

// create Chatroom scheme
var Chatroom = mongoose.model('Chatroom', {
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

// create User scheme
var User = mongoose.model('User', {
  email: String,
  username: String,
  password: String,
  encounters: Array,
  rooms: Array,
  socketIds: Array,
  isActive: Boolean, //active vs online
  log: {
    in: [],
    out: []
  },  
})

// send homepage
app.get('/', (req, res) => {
  res.sendFile((__dirname + '/keep the trash/Welcome.html'))
})

// redirect to any page (scripts)
// app.get('/*', (req, res) => {
//   page = req.params
//   res.sendFile(__dirname + '/keep the trash/' + page[0])
// })

io.on('connection', (socket) => {

  // socket helper functions

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

  // join room
  // expects string roomId
  const joinRoom = (roomId) => {
    return new Promise((resolve, reject) => {
      Chatroom.findById(roomId).exec((err, res) => {
        if (err) {
          reject(err)
        } else if (res) {
          socket.currentRoomId = res._id
          socket.join(res._id, () => {
            resolve(res)
          })
        } else {
          reject('not found')
          console.log('room was not found')
        }
      })
    })
  }

  // notify users that a message was read (does not precise)
  const notify = (sender, seenarr, userarr, roomId, actionType) => {
    return new Promise ((resolve, reject) => {
      userarr.forEach((user) => {
        User.findOne({username: user}).exec((err, res) => {
          if(err) {
            reject(err)
          } else if (res) {
            res.socketIds.forEach((element) => {
              if(element != socket.id) // prevent from sending to himself
                io.to(element).emit('notification', {res: {
                  roomId: roomId,
                  action: actionType,
                  seen: seenarr,
                  sender: sender
                }
              })
            })
            resolve()
          }
        })
      })
    })
  }


  // check existence of one user and implement promises lmoa wtf
  // expects string username
  const searchUser = (username) => {
    return new Promise((resolve, reject) => {
      User.findOne({username}).exec((err, res) => {
        if (err) {
          reject(err)
        }
        else if (res) {
          resolve({res: res.username})
        }
        else {
          resolve('error')
        }
      })
    })
  }

  // socket responses

  // creates new chatroom 
  // expects array of users (allows duplicates but not non-existent users)
  socket.on('createChatroom', (data) => {

    console.log('createChatroom called')

    if (data.length === 2) { // private chat
      Chatroom.find({Users: data}, (err, res) => {
        if (err) {
          console.log(err)
        } else if (res.length) {
          console.log('private chatroom already exists')
        } else {
          createChatroom(data)
        }
      })
    } else {
      createChatroom(data)
    }
  })

  // save new users in database
  // expects non-empty data
  socket.on('createUser', (data, callback) => {
    // check for {username || email} && password
    User.find({$and: [{$or: [{username: data.username}, {email: data.email}]}, {password: data.password}]},
      (err, res) => {
        if (err) {
          callback({err})
        }
        else if (res.length === 1) {
          callback({err: 'email or username taken'})
        }
        else if (res.length === 0) {
          const newUser = new User({username : data.username, 
                                    password: data.password, 
                                    email : data.email, 
                                    rooms: data.rooms, 
                                    'log.in': currentTime,
                                    socketIds: [socket.id]})
          newUser.save()
          callback({user: newUser})
        }
    })
  })  

  // manage disconnections
  socket.on('disconnect', () => {
    User.findOneAndUpdate({socketIds: socket.id}, {
      $pull: {'socketIds': socket.id},
      $push: {'log.out': currentTime}
    }, (err, res) => {
      err? console.log('err ' + err) : ''
    })
  })

  // send content of chatroom to chatWidgets
  socket.on('initChatroom', (data, callback) => {
    Chatroom.findById(data.id).exec((err, res) => {
      if (err) {
        console.log(err)
        callback({err})
      }
      else if (res) {
        let length = res.messages.length
        if (length > 0) {
          if (!res.messages[length - 1].seen.includes(data.username)) { // mark last message as read if unread by sender
            res.messages[length - 1].seen.push(data.username)
            res.save()
            res.Users.forEach((user) => { // notify each user that someone saw the most recent message
              notify(data.username ,res.messages[length - 1].seen , [user], res._id, 'seen').catch((err) => console.log(err))
            })
          }
          callback({messages: res.messages.slice((length < 100 ? 0 : length - 100), length)})
        }
      }
    })
  })

  // handle user login
  // expects object data with strings email, password
  socket.on('login', (data, ack) => {
    User.findOneAndUpdate({$and: [{$or: [{email: data.email}, {username: data.email}]}, {password: data.password}]}, 
    {$push: {'log.in': currentTime}},
    (err, doc, res) => {
      if (err) {
        ack({err: err})
      }
      else if (doc) {
        socket[doc.username] = socket.id
        ack({res: doc.username})
      }
      else {
        console.log('monkas')
      }
    })
  })

  // set logout for users
  // expects string username
  socket.on('logout', (username, ack) => {
    User.findOneAndUpdate({username: username},
    {$push: {'log.out': currentTime},
    $pull: {'socketIds': socket.id}},  
    (err, doc, res) => {
      if (err) {
        console.log(err)
        ack({err: 'err'})
      } else if (doc) {
        ack({res: 'ok'})
      } else {
        console.log('monkas')
      }
    }) 
  })

  // message handler: join room & emit messages
  // expects object data with strings roomId, sender, content
  socket.on('message', (data) => {
    // parse data into message model
    let newMessage = {
      sender: data.sender,
      content: data.content,
      time: currentTime,
      seen: [data.sender]
    }
    
    if (!socket.currentRoomId || socket.currentRoomId != data.roomId) { // if client has no room or the room is not the same
      joinRoom(data.roomId).then((roomObj) => {
          // update database
          roomObj.messages.push(newMessage)
          roomObj.save()
          let length = roomObj.messages.length
          
          // emit message
          io.in(socket.currentRoomId).emit('message_res', {res: data})

          // emit notification
          notify(data.sender, roomObj.messages[length - 1].seen, roomObj.Users, roomObj._id, 'message').then().catch((err) => console.log(err))
          
        }).catch((err) => {
          console.log(err)
        })
    } else if (socket.currentRoomId == data.roomId) { // client is already in room
        // update database
        Chatroom.findByIdAndUpdate({_id: socket.currentRoomId},
          {$push: {messages: newMessage}},
          (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              let length = res.messages.length

              // emit message
              io.in(socket.currentRoomId).emit('message_res', {res: data})
              
              // emit notification
              notify(data.sender, res.messages[length - 1].seen, res.Users, res._id, 'message').then().catch((err) => console.log(err))
            }
          })
    } else {
      console.log('actualy la fin')
    }
  })  

  // search chatrooms and expect array of users in alphabetical order
  socket.on('searchChatroom', (data, ack) => {
    // check if array is empty
    if (data.req.length === 0) {
      console.log('no search input')
    } else {
      // note -> only private chats 
      // search for chatroom which includes {sender} & {all of searched users || matching roomName}
      Chatroom.find({$or:
                       [{$and: [{Users: {$in: data.sender}}, 
                                {Users : {$regex: `.*${data.req}.*`, $options: 'i'}}]}, 
                        {$and: [{Users: {$in: data.sender}},
                                {roomName: {$regex: `.*${data.req}.*`, $options: 'i'}}]}]},
        (err, res) => {
        // error in search
        if (err) {
          console.log(err)
        } else if (res.length) { // found something
          // return the results
          let resArr = []
          res.forEach((e)=>{
            resArr.push(e)
          })
          ack({res: resArr})          
        } else { // nothing in database matching the search
          ack({err: 'nothing found'})
        }
      })
    }
  })

  // seaches for each in 
  // expects a list of users (arr)
  socket.on('searchUser', (arr, ack) => {
    let findUsers = Promise.all(arr.map(searchUser))
    findUsers.then((result) => {
      result.includes('error') ? ack({err: result}) : ack({res: result})
    })
    .catch((err) => {
      console.log(err)
    })
  })  

  socket.on('updateLogin', (data, ack) => {
    User.findOneAndUpdate({username: data.username}, 
    {$push: {'socketIds': socket.id}},
    (err, doc, res) => {
      if (err) {
        ack({err: err})
      }
      else if (doc) {
        ack({res: doc.username})
      }
      else {
        console.log('monkas')
      }
    })
  })
})

server.listen(PORT, () => {
  console.log('Server started on port ' + PORT)
})
