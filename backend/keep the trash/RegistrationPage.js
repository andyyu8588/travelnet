const socket = io(`https://204.197.178.47:4433`)
const domain = 'https://204.197.178.47:4433'
const homepage = `${domain}/Welcome.html`

const element = (e) => {
  return document.getElementById(e)
}

const form = element('form')
const username = element('username')
const password = element('password')
const email = element('email')
Empty = []

form.addEventListener('submit', (e) => {
  e.preventDefault()
  console.log('buttonpushed')
  socket.emit('createUser', {username: username.value, password: password.value, email: email.value, rooms: Empty})

  // listen for validation, set cookie and redirect to homepage
  socket.on('create_user_confirmation', (data) => {
    if (data === 'ok') {
      document.cookie = `username=${username.value}; SameSite=Strict`
      window.location.replace(homepage)
    } else if (data === 'email is taken') {
      alert('email is taken')
      email.value = ''
    } else if (data === 'username exists') {
      alert('username is taken')
      username.value = ''
    } else {
      alert('an error occured')
      window.location.reload()
    }
  })
})
