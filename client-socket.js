const socket = io(`http://localhost:3000`)
const select = document.getElementById('select')
const messagebox = document.getElementById('message')
const chatmsg = document.getElementById('text')
const add = document.getElementById('add')
const userform = document.getElementById('userform')
const recipient = document.getElementById('recipient')
const RegistrationPage = 'http://localhost:3000/RegistrationPage.html'
document.getElementById('tohomepage').href = RegistrationPage



if(document.cookie != ''){
    let cookie
    var userArray = []
    socket.emit('cookie', document.cookie)
    socket.on('cookieres', (data) => {
        if(data != {}){
            cookie = data
            $('#username').append(`${cookie.username}`)
            userArray.push(cookie.username)
        }
        else{
            alert('there was an error processing your demand')
            document.location.reload()
        }
    })

    add.addEventListener('click', (e) => {
        e.preventDefault()
        socket.emit('searchUser', recipient.value)
        console.log(recipient.value)

        select.addEventListener('click', (e)=>{
            e.preventDefault()
            console.log('select button clicked'+userArray)
            socket.emit('createChatroom', userArray)
            userArray= []
        })
    })

    socket.on('searchUser_res', (data)=>{
        if(data === 'does not exist'){
            console.log(data)
        } else {
            userArray.push(data)
        }
        recipient.value = '' 
    })




    socket.on('createChatroom_res', (data) => {
        if(data === 'error'){
            console.log('there is an error')
        }
        else if(data){
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
            chatmsg.value = ''
            if (data.sender != cookie.username) {
                $('#chatroom').append(`<li>${data.sender}: ${data.msg} (${data.time})</li>`)
            } else {
                $('#chatroom').append(`<li>You: ${data.msg} (${data.time})</li>`)
            }  
        })
    }

else{
    alert('you must have an account to chat')
    document.location.replace(RegistrationPage)
}