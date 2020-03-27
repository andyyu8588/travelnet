const socket = io(`http://localhost:3000`)

var element = (e)=>{
    return document.getElementById(e)
}

const button = element('submit')
var username = element('username')
var password = element('password')
var email = element('email')

button.addEventListener('click',(e)=>{
e.preventDefault()
console.log('buttonpushed')
socket.emit('createUser',{username:username.value,password:password.value,email:email.value})
username.value = ''
password.value = ''
email.value = ''
})

