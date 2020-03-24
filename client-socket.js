const socket = io(`http://localhost:3000`)
// const chat = document.getElementById('1')
// const chatbox = document.getElementById('text')

socket.on('message', (e)=>{
    console.log('the message is: ' + e)
    $('#1').append(`<li>${e}</li>`)
})

//cancele
// chatbox.addEventListener('submit', (e) => {
//     })