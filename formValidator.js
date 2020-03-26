const socket = io(`http://localhost:3000`)

var element = (e)=>{
    return document.getElementById(e)
}

const button = element('submit')
var username = element('username')
var password = element('password')
var email = element('email')

button.addEventListener('submit',(e)=>{
e.preventDefault()
socket.emit('createUser',({username:username,password:password,email:email})