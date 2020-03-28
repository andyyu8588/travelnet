const og = 'http://localhost:3000/'
const socket = io(og)
document.getElementById('messaging').href = og +'messaging.html'
document.getElementById('login').href = og + 'login.html'
document.getElementById('RegistrationPage').href = og + 'RegistrationPage.html'
cookie 

if(document.cookie != ''){
    socket.emit('cookie', document.cookie)
}

socket.on('cookieres', data=>{
    cookie = data
        $('#other').append(`<p>hi ${cookie.username}</p>`)
})

