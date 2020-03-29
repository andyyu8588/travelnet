const og = 'http://localhost:3000/'
const socket = io(og)
document.getElementById('messaging').href = og +'messaging.html'
document.getElementById('login').href = og + 'login.html'
document.getElementById('RegistrationPage').href = og + 'RegistrationPage.html'
document.getElementById('disconnect').href = og
var logout = document.getElementById('disconnect')

if(document.cookie != ''){
    socket.emit('cookie', document.cookie)

    socket.on('cookieres', data=>{
        let cookie = data
        console.log(cookie)
        $('#other').append(`<p>hi ${cookie.username}</p>`)
    })
}

logout.addEventListener('submit', (e)=>{
    e.preventDefault()
    document.cookie= `name=;expires= Thu, 01 Jan 2010 00:00:00 GMT`
    document.location.reload()
} )