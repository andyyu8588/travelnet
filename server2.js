const joinroom  = (user, room) => {
    // assign room to client
    socket.join(room)

    // socket.room = room

    console.log(`${user} connected to: ${room}`)
}

function searchUser(x){
    socket.on('searchuser', (data) => {
        User.find({username: data}, (err, res) => {
            if (err) {
                console.log(err)
            } 
            else if (res.lenght === 0) {
                socket.emit('searchuser_res', 'does not exists')
            }
            else if (res.lenght === 1) {
                socket.emit("searchuser_res", res[0].username)
            }
            else {
                console.log('wtf searchuser')
            }
        })
    })
}

module.exports = joinroom, searchUser;

