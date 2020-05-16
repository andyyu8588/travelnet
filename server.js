const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const http = require('http')
const path = require('path')
const mongoose = require('mongoose')
const jwtSecret = 'MonkasczI69'

const jwtMiddleware = require('./jwt.middleware')

// setup http server (https in heroku tho)
const PORT = process.env.PORT || 3000
const app = express()
const router = express.Router()
const server = http.createServer(app)
const io = require('socket.io').listen(server)

// import helper functions
const utils = require('./utils')

// import models
const User = require("./models/User")
const Chatroom = require("./models/Chatroom")

// take time
const currentTime = new Date().toISOString()

// set URL:
const dbURL = 'mongodb://heroku_ln0g37cv:cvo479sjkhpub1i2d9blgin18t@ds147304.mlab.com:47304/heroku_ln0g37cv'

// open server
server.listen(PORT, () => {
  console.log('Server started on port ' + PORT)
})

// send homepage
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  )
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, GET, PUT")
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'frontend', 'index.html'))
  next()
})

// allow static access to folder to get js
app.use('/', express.static(path.join(__dirname, 'frontend', 'dist', 'frontend')))

app.get('friends',jwtMiddleware, (req, res, next) => {
  res.status(201)
  console.log('friends received')
})

// connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, (err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log('lit')
  }
})

io.on('connection', (socket) => {

  // socket helper functions
  
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
          utils.createChatroom(data)
        }
      })
    } else {
      utils.createChatroom(data)
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
          console.log(data.birthdate)
          bcrypt.hash(data.password, 10)
          .then((result) => {
            const newUser = new User({username : data.username, 
                                    password: result, 
                                    email : data.email,
                                    firstname: data.firstName, 
                                    lastname: data.lastName, 
                                    birthdate: data.birthdate,
                                    gender: data.gender,
                                    rooms: data.rooms, 
                                    'log.in': currentTime,
                                    socketIds: [socket.id]})
            newUser.save()
            const token = jwt.sign({
              id: newUser._id
            }, jwtSecret)
            callback({user: newUser, token: token})
          })
          .catch((err) => {
            callback({err: err})
          })
        }
    })
  })  

  socket.on('deleteUser', (username, callback) => {
    User.findOneAndDelete({username}, (err, res) => {
      if (err) {
        callback({err})
      } else {        
        Chatroom.find({Users: username}, (err, res) => {
          if (err) {
            callback(err)
          } else {
            res.forEach((room) => {
              room.remove()
            })
            callback({res: `user ${username} successfully deleted!`})
          }
        })
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

  // change user data
  socket.on('editUser', (data, callback) => {
    utils.editUser(data.username, data.proprety, data.newProprety).then((result) => {
      callback(result)
    }).catch((err) => {
      callback(err)
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
    User.findOneAndUpdate({$or: [{email: data.email}, {username: data.email}]}, 
    {$push: {'log.in': currentTime}},
    (err, doc, res) => {
      if (err) {
        ack({err: err})
      }
      else if (doc) {
        bcrypt.compare(data.password, doc.password)
        .then((resultBool) => {
          if(resultBool){
            const token = jwt.sign({
              id: doc._id
            }, jwtSecret)
            socket[doc.username] = socket.id
            ack({res: doc.username, token: token})       
          } else {
            ack({err: 'login failed'})
          }
        })
        .catch((err) => {
          ack({err: err})
        })

      }
      else {
        ack({err: 'not found'})
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
    if (!data.req.length) {
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
    let findUsers = Promise.all(arr.map(utils.searchUser))
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