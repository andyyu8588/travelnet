const socket = io(`http://localhost:3000`)
const recipient = document.getElementById('selectrecipient')
const user2 = document.getElementById('recipient')
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
        console.log('select button click')
        // s
        socket.emit('CreateChatroom', {user1: cookie.username,user2: user2.value})
    })

    socket.on('CreateChatroom_res', (data)=>{
        if(data){
            data.forEach(element => {
                $('#chatroom').append(`<li>${element.sender}: ${element.content} (${element.time})</li>`)            
            });
        }else{
            console.log('chat is empty')
        }
    })

    // add msg from user to server
    messagebox.addEventListener('submit', (e) => {
        e.preventDefault()
        console.log('send button click')
        socket.emit('message', ({msg: chatmsg.value, sender: cookie.username}))
        })

        // listen for msg & username from server
        socket.on('message', (data) => {
            console.log(data)
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