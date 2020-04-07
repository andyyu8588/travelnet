const joinroom  = (socket, room) => {
    // assign room to socket of client
    socket.join(room)
    socket.room = room
}


module.exports = {joinroom};