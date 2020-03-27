const socket = io(`http://localhost:3000`)
const homepage = 'http://localhost:3000/Welcome.html'

var element = (e)=>{
    return document.getElementById(e)
}

const form = element('form')
var password = element('password')
var email = element('email/user')
Empty = []

 form.addEventListener('submit',(e)=>{
    e.preventDefault()
    console.log('buttonpushed')
    socket.emit('UserIn',{password:password.value,email:email.value})

    //listen for validation, set cookie and redirect to homepage
    socket.on('UserIn', (res)=>{
        if(res.ans === 'ok'){
            document.cookie = `username=${res.cookie}`    
            window.location.replace(homepage)
        }
        else if(res.exp === 'email' || 'username'){
            alert(`${res.exp} or password is not correct`)
            window.location.reload()
        }
        else{
            alert('an error occured')
            window.location.reload()
        }
    })
})

