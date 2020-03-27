const socket = io(`http://localhost:3000`)

var element = (e)=>{
    return document.getElementById(e)
}

const form = element('form')
var username = element('username')
var password = element('password')
var email = element('email')
Empty = []

 form.addEventListener('submit',(e)=>{
e.preventDefault()
console.log('buttonpushed')
socket.emit('createUser',{username:username.value,password:password.value,email:email.value,rooms:Empty})

username.value = ''
password.value = ''
email.value = ''
})

