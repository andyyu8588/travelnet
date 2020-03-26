const socket = io(`http://localhost:3000`)
const chat = document.getElementById('chatbox')
const chatmsg = document.getElementById('text')

//get username
const username = prompt('username')
var text = document.getElementById("username")
text.innerHTML = username

//get room
const room = prompt('connect to a room')
const text2 = document.getElementById("room")
text2.innerHTML = room

//runs upon connection
socket.on('connect', ()=>{
    socket.emit('join_room', room)
})

//listen for msg & usernamecls from server
socket.on('message', (data)=>{
    $('#chatroom').append(`<li>${data.name}: ${data.msg}</li>`)
    })

//add msg from user to server
chat.addEventListener('submit', (e)=>{
   e.preventDefault()
   if(chatmsg.value){
        $('#chatroom').append(`<li>You: ${chatmsg.value}</li>`)
        socket.emit('message', ({msg: chatmsg.value, name:username}))
        chatmsg.value = ''  
   }
})