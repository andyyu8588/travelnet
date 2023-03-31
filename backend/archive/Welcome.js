const og = 'https://204.197.178.47:443'
const socket = io(og)
document.getElementById('messaging').href = og +'messaging.html'
document.getElementById('login').href = og + 'login.html'
document.getElementById('RegistrationPage').href = og + 'RegistrationPage.html'
document.getElementById('disconnect').href = og
const logout = document.getElementById('disconnect')

if (document.cookie != '') {
  socket.emit('cookie', document.cookie)

  socket.on('cookieres', (data) => {
    const cookie = data
    console.log(cookie)
    $('#other').append(`<p>hi ${cookie.username}</p>`)
  })

  logout.addEventListener('click', (e) => {
    e.preventDefault()
    document.cookie= `username=;expires= Thu, 01 Jan 2010 00:00:00 GMT`
    console.log(document.cookie)
    document.location.reload()
  })
} else {
  logout.style.display = 'none'
}
