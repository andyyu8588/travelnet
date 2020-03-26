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

//join room upon connection
socket.on('connect', ()=>{
    socket.emit('join_room', room)
    
    //send username to server   
    socket.emit('username', username)
})

//listen for msg & username from server
socket.on('message', (data)=>{
    $('#chatroom').append(`<li>${data.user}: ${data.msg}</li>`)
    })

//add msg from user to server
chat.addEventListener('submit', (e)=>{
   e.preventDefault()
   if(chatmsg.value){
        $('#chatroom').append(`<li>You: ${chatmsg.value}</li>`)
        socket.emit('message', ({msg: chatmsg.value, user: username}))
        chatmsg.value = ''  
   }
})