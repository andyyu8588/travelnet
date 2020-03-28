const socket = io(`http://localhost:3000`)
const domain = 'http://localhost:3000'
const homepage = `${domain}/Welcome.html`

var element = (e) => {
    return document.getElementById(e)
}

const form = element('form')
var username = element('username')
var password = element('password')
var email = element('email')
Empty = []

 form.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log('buttonpushed')
    socket.emit('createUser', {username:username.value,password:password.value,email:email.value,rooms:Empty})

    // listen for validation, set cookie and redirect to homepage
    socket.on('create_user_confirmation', (data) => {
        if (data === 'ok') {
            document.cookie = `username=${username.value}; SameSite=Strict`
            window.location.replace(homepage)
        }
        else if (data === 'email is taken') {
            alert('email is taken')
            email.value = ''
        }
        else if (data === 'username exists') {
            alert('username is taken')
            username.value = ''
        }
        else {
            alert('an error occured')
            window.location.reload()
        }
    })
})