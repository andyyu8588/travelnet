    recipient.addEventListener('submit', (e)=>{
        e.preventDefault()
        console.log('select button clicked')
        socket.emit('CreateChatroom', userArray)
        userArray= []
    })

      //handle chatrooms & messages
  socket.on('CreateChatroom',(data)=>{
    Chatroom.find({Users:{$all:[data]}},(err,res)=>{
      if(err){
        console.log(err)
      }
      else if(res.length >= 1){
        console.log('chatroom exists', res)
        socket.emit('CreateChatroom_res',res)
      }
      else{
        if(res.length >= 1){
            console.log(res[0].username)
            var newChatroom = new Chatroom({Users : data, Messages : []})
            newChatroom.save()
            socket.emit('CreateChatroom_res')
          }
          else{
            console.log(res[0])
            socket.emit('CreateChatroom_res', 'error')
          }
      }