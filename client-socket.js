const socket = io(`http://localhost:3000`)
const recipient = document.getElementById('selectrecipient')
const user2 = document.getElementById('user2')
const messagebox = document.getElementById('message')
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

    recipient.addEventListener('submit', (e)=>{
        e.preventDefault()
        socket.emit('CreateChatroom', {user1: cookie.username,user2: user2.value})
    })

    socket.on('CreateChatroom_res', data=>{
        if(data != []){
            data.forEach(element => {
                $('#chatroom').append(`<li>${element.sender}: ${element.content} (${element.time})</li>`)            
            });
        }
    })

    // add msg from user to server
    messagebox.addEventListener('submit', (e) => {
        e.preventDefault()
        console.log('send button click')
        if (chatmsg.value.length != 0) {
            socket.emit('message', ({msg: chatmsg.value, sender: cookie.username}))
        }
        })

        // listen for msg & username from server
        socket.on('message', (data) => {
            $('#chatroom').append(`<li>You: ${chatmsg.value} (${Date.now})</li>`)
            chatmsg.value = ''
            if(data.sender != cookie.username){
                $('#chatroom').append(`<li>${data.sender}: ${data.msg} (${data.time})</li>`)
            }  
        })
    }

else{
    alert('you must have an account to chat')
    // document.location.replace('http://3000/RegistrationPage.html')
}