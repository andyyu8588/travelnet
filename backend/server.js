const express = require('express')
const cookieParser = require('cookie')
const http = require('http')
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const currentTime = new Date().toISOString()

// set socket.io
const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)

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
  Users: Array, 
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
  isActive: Boolean, //active vs online
  log: {
    in: [],
    out: []
  },  
})

// env.PORT be useless tho
server.listen(3000, () => {
  console.log('Server started on port ' + PORT)
})

// send homepage
app.get('/', (req, res) => {
  res.sendFile((__dirname + '/keep the trash/Welcome.html'))
})

// redirect to any page (scripts)
app.get('/*', (req, res) => {
  page = req.params
  res.sendFile(__dirname + '/keep the trash/' + page[0])
})

io.on('connection', (socket) => {

  // socket helper functions

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

  // check existence of one user and implement promises lmoa wtf 
  const searchUser = (user) => {
    return new Promise((resolve, reject) => {
      User.findOne({username: user}).exec((err, res) => {
        if(err){
          reject(err)
        }
        else if(res) {
          user = res.username
          resolve({res: res.username})
        }
        else {
          resolve('error')
        }
      })
    })
  }

  // message handler: join room & emit messages
  socket.on('message', (data) => {
    if (!socket.currentRoomId || socket.currentRoomId != data.roomId) { // need to Chatroom.find()
      joinRoom(data.roomId).then((roomObj) => {
          console.log('joined')
          io.in(socket.currentRoomId).emit('message_res', {res: data})
          roomObj.messages.push({
            sender: data.sender,
            content: data.content,
            time: currentTime,
            seen: [data.sender]
          })
          roomObj.save()
        }).catch((err) => {
          console.log(err)
        })
    } else if (socket.currentRoomId == data.roomId) {
        console.log('already in room')
        Chatroom.findByIdAndUpdate({_id: socket.currentRoomId},
          {$push: {messages: {
            sender: data.sender,
            content: data.content,
            time: currentTime,
            seen: [data.sender]
          }}}, (err) => {
            if (err) {
              console.log(err)
            } else {
              io.in(socket.currentRoomId).emit('message_res', {res: data})
            }
          })
    } else {
      console.log('actualy la fin')
    }
  }) 

  // socket responses

  // handle user login
  socket.on('login', (data) => {
    console.log(data)
    User.findOneAndUpdate({$and:[{$or:[{email:data.email}, {username:data.email}]}, {password: data.password}]}, {
      $push : {'log.in' : currentTime}
    }, (err, doc, res) => {
      console.log(doc)
      if (err) {
        console.log(err)
        socket.emit('login_res', {err: err})
      }
      else if (doc) {
        socket.emit('login_res', {res: doc.username})
      }
      else {
        console.log('monkas')
      }
    })
  })

  //set logout for users
  socket.on('logout', (user) => {
    console.log(user)
    User.findOneAndUpdate({username: user},
    {
      $push : {'log.out' : currentTime}
    }, (err,res) => {
      if (err) {
        console.log(err)
      }
      else if (res) {
        console.log('updated')
      } else {

      }
    }
    ) 
  })

  // receive and send parsed cookie
  socket.on('cookie', (data) => {
    let cookie = cookieParser.parse(data)
    socket.emit('cookieres', {res: cookie})
    socket.username = cookie.username
  })

  // save new users in database
  socket.on('createUser', (data) => {
    let x = 0
    for(let key in data){
      if(data[key] === ''){
        x++
        console.log(`error ${key} is empty`)
      }
    } 
    if(x === 0){
      // check if username or email already exists & send answer to client
      User.find({email:data.email}, (err,res) => {
        console.log('searched')
        if (err) {
          console.log(err)
        }
        else if (res.length === 1) {
          socket.emit('createUser_res', {err: 'email is taken'})
        }
        else {
          User.find({username:data.username}, (error, res1) => {
            if (error) {    
              socket.emit('createUser_res', {err: 'error'})
              console.log(error)
            }
            else if (res1.length === 1) {
              socket.emit('createUser_res', {err: 'username exists'})
            }
            else if (res1.length === 0) {
              var newuser = new User({username : data.username, password: data.password, email : data.email, rooms: data.rooms, 'log.in': currentTime})
              newuser.save()
              socket.emit('createUser_res', {res: newuser})
            }
            else {
              console.log('wtf happened')
            }
          })
        }
      })
    }
  })

  // seaches for each in list of users 
  socket.on('searchUser', (arr) => {
    console.log('searchuser called')
    let reform = arr.map(searchUser)
    let wat = Promise.all(reform)
    wat.then(result => {
      console.log(result)
      result.includes('error') ? socket.emit('searchUser_res', {err: result}) : socket.emit('searchUser_res', {res: result})
    })
    .catch(err => {console.log(err)})
  })

  // search chatrooms and expect array of users in alphabetical order
  socket.on('searchChatroom', (data) => {
    // check if array is empty
    if (data.req.length === 0) {
      console.log('no search input')
    } else {
      // note -> only private chats 
      // search for chatroom which includes {sender} & {all of searched users || matching roomName}
      Chatroom.find( {$or: [{$and: [{Users: {$in: data.sender}}, {Users : {$regex: `.*${data.req}.*`, $options: 'i'}}]}, {$and: [{Users: {$in: data.sender}}, {roomName: {$regex: `.*${data.req.toString()}.*`, $options: 'i'}}]}]}, (err, res) => {
        // error in search
        if (err) {
          console.log(err)
        } else if (res.length) { // found something
          // return the results
          let resArr = []
          res.forEach((e)=>{
            resArr.push(e)
          })
          socket.emit('searchChatroom_res', {res: resArr})          
        } else { // nothing in database matching the search
          socket.emit('searchChatroom_res', 'nothing found')
        }
      })
    }
  })

  // send content of chatroom to chatWidgets
  socket.on('initChatroom', (data) => {
    console.log(`chatroom init for ${data.id}`)
    Chatroom.findById(data.id).exec((err, res) => {
      if (err) {
        console.log(err)
        socket.emit('initChatroom_res', {err: err})
      }
      else if (res) {
        // console.log('chatroom exists')
        let length = res.messages.length
        if (length > 0) {
          if (!res.messages[length - 1].seen.includes(data.username)) {
            res.messages[length - 1].seen.push(data.username)
            res.save()
          }
          socket.emit('initChatroom_res', {res: res.messages.slice((length < 100 ? 0 : length - 100), length)})
        }
      }
      else {
        console.log('parti loin')        
      }
    })
  })

  // Chatroom.findByIdAndUpdate({_id: id}, 
  //   {$push: {messages[messages.length - 1].seen: username}},
  //   (err) => {
  //     if (err) {
  //       console.log(err)
  //     } else {
  //       console.log()
  //     }
  //   }
  // })

  // creates new chatroom with all users in array (allows duplicates but not non-existent users)
  socket.on('createChatroom', (data) => {
    console.log('createChatroom called')
    console.log(`chatroom created: ${data}`)
    console.log(data)
    const newChatroom = new Chatroom({Users : data, roomName : data.toString(), messages : [], userNum: data.length })
    newChatroom.save()
    data.forEach((user) => {
      User.findOneAndUpdate({username: user}, 
        {$push: {rooms: newChatroom._id.toString()}}, (err) => {
          if (err) {
            console.log(err)
          } else {
            console.log('room added to user')
          }
        })      
    })
  })

  // manage disconnections
  socket.on('disconnect', () => {
    console.log(`disconnected`)
  })
})