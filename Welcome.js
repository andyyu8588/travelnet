const og = 'http://localhost:3000/'
const socket = io(og)
document.getElementById('messaging').href = og +'messaging.html'
document.getElementById('login').href = og + 'login.html'
document.getElementById('RegistrationPage').href = og + 'RegistrationPage.html'

if(document.cookie != ''){
    socket.emit('cookie', document.cookie)

    socket.on('cookieres', data=>{
        let cookie = data
        console.log(cookie)
        $('#other').append(`<p>hi ${cookie.username}</p>`)
    })
}