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

//send username to server
socket.emit('username', username)



//listen for msg from server
socket.on('message', (msgdata)=>{
   
    //listen for username from server
    socket.on('username', (data)=>{
        $('#chatroom').append(`<li>${data}: ${msgdata}</li>`)
    })
    
    
})

//add msg from user to server
chat.addEventListener('submit', (e)=>{
   e.preventDefault()
   if(chatmsg.value){
        $('#chatroom').append(`<li>You: ${chatmsg.value}</li>`)
        socket.emit('message', (chatmsg.value))
        chatmsg.value = ''  
   }
})