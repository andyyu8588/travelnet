module.exports ={
    joinroom(user,room) {
    //assign room to client
    socket.join(room)
    //socket.room = room
    console.log(`${user} connected to: ${room}`)
    }
}

  
