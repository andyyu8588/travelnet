const socket = io(`http://localhost:3000`)
const select = document.getElementById('select')
const messagebox = document.getElementById('message')
const chatmsg = document.getElementById('text')
const add = document.getElementById('add')
const userform = document.getElementById('userform')
const recipient = document.getElementById('recipient')
const RegistrationPage = 'http://localhost:3000/RegistrationPage.html'
document.getElementById('tohomepage').href = RegistrationPage


if (document.cookie != '') {
  let cookie
  const userArray = []

  socket.emit('cookie', document.cookie)
  socket.on('cookieres', (data) => {
    if (data != {}) {
      cookie = data
      $('#username').append(`${cookie.username}`)
    } else {
      alert('there was an error processing your demand')
      document.location.reload()
    }
  })

  add.addEventListener('click', (e) => {
    e.preventDefault()
    socket.emit('searchUser', recipient.value)

    select.addEventListener('click', (e) => {
      e.preventDefault()
      if (!userArray.length) {
        console.log('please enter a recipient')
      } else {
        userArray.push(cookie.username)
        let polishedArray = userArray.filter((a, b) => userArray.indexOf(a) === (b))
        polishedArray.sort()
        socket.emit('createChatroom', polishedArray)
        userArray, polishedArray = []
      }
    })
  })

  socket.on('searchUser_res', (data) => {
    if (data === 'does not exist') {
      recipient.value = ''
    } else {
      userArray.push(data)
      recipient.readOnly = true
    }
    console.log(`added recipient: `+ data)
  })

  socket.on('createChatroom_res', (data) => {
    if (data === 'error') {
      console.log('there is an error')
    } else if (data) {
      data.forEach((element) => {
        if (element.sender != cookie.username) {
          $('#chatroom').append(`<li>${element.sender}: ${element.content}</li>`)
        } else {
          $('#chatroom').append(`<li>You: ${element.content}</li>`)
        }
      })
    } else {
      console.log('chat is empty')
    }
  })

  // add msg from user to server
  messagebox.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log('send button click')
    socket.emit('message', ({msg: chatmsg.value, sender: cookie.username}))
    chatmsg.value = ''
  })

  // listen for msg & username from server
  socket.on('message_res', (data) => {
    console.log(data)
    if (data.sender != cookie.username) {
      $('#chatroom').append(`<li>${data.sender}: ${data.msg}</li>`)
    } else {
      $('#chatroom').append(`<li>You: ${data.msg}</li>`)
    }
  })
} else {
  alert('you must have an account to chat')
  document.location.replace(RegistrationPage)
}
