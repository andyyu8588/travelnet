const socket = io(`http://localhost:3000`)
const recipient = document.getElementById('recipient')
const chatmsg = document.getElementById('text')
const RegistrationPage = 'http://localhost:3000/RegistrationPage.html'
document.getElementById('tohomepage').href = RegistrationPage

if(document.cookie != ''){

    cookie
    socket.emit('cookie', document.cookie)
    socket.on('cookieres', data=>{
        if(data != {}){
            cookie = data
        }
        else{
            alert('there was an error processing your demand')
            document.location.reload()
        }
    })

    // add msg from user to server
    form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (chatmsg.value.length != 0) {
        socket.emit('CreateChatroom', {user1: cookie.username,user2: recipient.value})
        socket.emit('message', ({msg: chatmsg.value, user: username}))
        chatmsg.value = ''  
    }
    })

    // listen for msg & username from server
    socket.on('message', (data) => {
        $('#chatroom').append(`<li>You: ${chatmsg.value}</li>`)
        $('#chatroom').append(`<li>${data.user}: ${data.msg}</li>`)
    })
    }

else{
    alert('you must have an account to chat')
    // document.location.replace('http://3000/RegistrationPage.html')
}