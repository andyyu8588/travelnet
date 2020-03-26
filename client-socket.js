const socket = io(`http://localhost:3000`)
const chat = document.getElementById('chatbox')
const chatmsg = document.getElementById('text')
const room = prompt('connect to a room')
// const receiver = prompt('receiver')
var text = document.getElementById("sender")
// const text2 = document.getElementById("receiver")
// text2.innerHTML = `${receiver}`
text.innerHTML = room

//runs upon connection
socket.on('connect', ()=>{
    socket.emit('join_room', room)
})

//add msg from server to user
socket.on('message', (data)=>{
    $('#chatroom').append(`<li>${data}</li>`)
})

//add msg from user to server
chat.addEventListener('submit', (e)=>{
   e.preventDefault()
   if(chatmsg.value){
        $('#chatroom').append(`<li>${chatmsg.value}</li>`)
        socket.emit('message', (chatmsg.value))
        chatmsg.value = ''  
   }
})

