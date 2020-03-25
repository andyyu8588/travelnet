const socket = io(`http://localhost:3000`)
const chat = document.getElementById('chatbox')
const chatmsg = document.getElementById('text')
// const sender = prompt('sender')
// const receiver = prompt('receiver')
// const text = document.getElementById("sender")
// const text2 = document.getElementById("receiver")
// text2.innerHTML = `${receiver}`
// text.innerHTML = `${sender}`

socket.on('chatmessage', (data)=>{
    console.log(data)
    $('#1').append(`<li>${data}</li>`)
    console.log(socket.id)
})

chat.addEventListener('submit', (e)=>{
   e.preventDefault()
   if(chatmsg.value){
        $('#1').append(`<li>${chatmsg.value}</li>`)
        socket.emit('chatmessage', chatmsg.value)
        chatmsg.value = ''  
   }
})

