const express = require('express')
const cookieParser = require('cookie')
const http = require('http')
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')

const app = express()
const server = http.createServer(app)
const io = require('socket.io').listen(server)

// to implement with socket.on('disconnect')

// set URL:
var dbURL = 'mongodb://localhost/Travelnet'

// connect mongoose to Mongodb
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
  if (err) {
    console.log(err)
  }
  else {
    console.log('lit')
  }
})

// create Chatroom scheme
var Chatroom = mongoose.model('Chatroom', {
  roomName : String,
  userNum : Number,
  Users : Array, 
  messages: [
    {content: String,
    sender: String,
    delivered: Boolean,
    read: Boolean
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

  // monkas sa marche
  socket.emit('test', 'monkas sa marche')

  // socket helper functions

  // handle join room & send back message history
  const joinRoom = (databaseobj, roomnum, message) => {
    socket.join(`${roomnum}`, () => {
      socket.room = roomnum
      socket.emit('createChatroom_res', {res: message})
      console.log(`joined ${socket.room}`)
      messageHandler(databaseobj)
    })  
  }
 
  // handle live chat on first connect to chatroom
  const messageHandler = (databaseobj) => { 
    if (socket.room) {
      console.log('message handler called')
      socket.on('message', (data) => {
        databaseobj.messages.push({
          sender: data.sender,
          content: data.content 
        })
        databaseobj.save()
        socket.emit('message_res', data)
        socket.in(`${socket.room}`).emit('message_res', data)
      })
    } else {
      console.log('message handler monkas')
    }
  }

  // socket responses

  // confirm login has worked
  socket.on('login', (data) => {
    console.log(`loginreceived ${data.username}, ${data.password}`)
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
              var newuser = new User({username : data.username, password: data.password, email : data.email, rooms: data.rooms})
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

  socket.on('searchUser', (data) => {
    User.find({username: data}, (err, res) => {
        if (err) {
          console.log(err)
        } 
        else if (res.length === 0) {
          socket.emit('searchUser_res', {err: 'does not exist'})
        }
        else if (res.length === 1) {
          socket.emit("searchUser_res", {res: res[0].username})
        }
        else {
          console.log('wtf searchUser')
        }
    })
  })

  // search chatrooms
  socket.on('searchChatroom', (data) => {
    //expect array of users in alphabetical order

    // check if array is empty
    if (data.req.length === 0) {
      console.log('no search input')
    } else {
      // search for chatroom which includes {sender & all of searched users} || {matching roomMane}
      Chatroom.find( {$or: [{$and:[{Users: {$in: data.sender}}, {Users : {$in: data.req}}]}, {roomName: {$in:[data.req.toString()]}}]}, (err, res) => {
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
          console.log('no results in database')
          socket.emit('searchChatroom_res', 'nothing found')
        }
      })
    }
  })

  // handle chatrooms & assign socket.join(room) w/ chatroom id as room
  socket.on('createChatroom', (data) => {
    if (!socket.room) {
      console.log(`chatroom req for ${data}`)
      Chatroom.find({Users: data, userNum: data.length}, (err,res) => {
        if (err) {
          console.log(err)
        }
        else if (res.length === 1) {
          console.log('chatroom exists')
          joinRoom(res[0], res[0].id, res[0].messages)
        }
        else {
          var newChatroom = new Chatroom({Users : data, roomName : data.toString(), messages : [], userNum: data.length })
          newChatroom.save((err, product) => {
            if (err) {
              console.log(err)
            }
            else {
              console.log('new chatroom created')
              joinRoom(product, product.id, product.messages)
            }
          })
        }
      })
    } else {
      console.log(`client already in chat ${socket.room}`)
    }
  })

  // handle user login
  socket.on('UserIn', (data) => {
    User.find( {$and:[{$or:[{email:data.email}, {username:data.email}]}, {password: data.password}]}, (err, res) => {
      if (err) {
        console.log(err)
        socket.emit('UserIn_res', {err: err})
      }
      else if (res.length === 1) {
        socket.emit('UserIn_res', {res: res[0].username})
      }
      else if (res.length === 0){
        socket.emit('UserIn_res', {err: 'not found'})
      }
      else {
        console.log('monkas')
      }
    })
  })

  // manage disconnections (to implement)
  socket.on('disconnect', ()=>{
    console.log(`disconnected`)
  })
})