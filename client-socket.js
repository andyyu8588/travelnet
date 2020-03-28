const socket = io(`http://localhost:3000`)
const recipient = document.getElementById('recipient')
const user2 = document.getElementById('user2')
const chatmsg = document.getElementById('text')
const RegistrationPage = 'http://localhost:3000/RegistrationPage.html'
document.getElementById('tohomepage').href = RegistrationPage

if(document.cookie != ''){
    let cookie
    socket.emit('cookie', document.cookie)
    socket.on('cookieres', data=>{
        if(data != {}){
            cookie = data
            $('#username').append(`${cookie.username}`)
        }
        else{
            alert('there was an error processing your demand')
            document.location.reload()
        }
    })

    // add msg from user to server
    recipient.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log('send button click')
    if (chatmsg.value.length != 0) {
        socket.emit('CreateChatroom', {user1: cookie.username,user2: user2.value})
        socket.emit('message', ({msg: chatmsg.value, sender: cookie.username}))
        
    }
    })

    socket.on('Chatroom', data=>{
        console.log(data)
    })

    // listen for msg & username from server
    socket.on('message', (data) => {
        $('#chatroom').append(`<li>You: ${chatmsg.value}</li>`)
        chatmsg.value = ''  
        $('#chatroom').append(`<li>${data.sender}: ${data.msg}</li>`)
    })
    }

else{
    alert('you must have an account to chat')
    // document.location.replace('http://3000/RegistrationPage.html')
}