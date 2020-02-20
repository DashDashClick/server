const express = require('express')
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const { Room } = require('./models')
const cors = require('cors')

app.get('/', function(req, res){
  console.log('masup pak')
})

app.use(cors())
app.use(express.json()) 
app.use(express.urlencoded({ extended: false }))

let scores = []

io.on('connection', socket => {

  socket.on('createRoom', payload => {
    Room.create({
      name: payload.roomName
    })
      .then(room => {
        socket.join(room.id, err => {
          if (err) {
            console.log(err)
          } else {
            console.log('room created')
            io.emit('roomCreated', room)
          }
        })
      })
      .catch(err => console.log(err))
  })

  socket.on('fetchRoom', () => {
    Room.findAll()
      .then(rooms => {
        socket.emit('showRooms', rooms)
      })
      .catch(err => console.log(err))
  })

  socket.on('joinRoom', payload => {
    socket.join(payload.id, () => {
      io.to(payload.id).emit('joined', payload)
      scores = []
    })
  })
  
  socket.on('inGame', payload=> {
    socket.join(payload.id.id, () => {
      // io.to(payload.id).emit('joined', payload)
      scores.push(payload)
      // console.log(scores.length, 'ini panjangnya');
      // console.log(scores, 'ini scorenya');
      if (scores.length > 1) {
        // scores.sort(function(a, b) {
          //   return b[1] - a[1];
          // });
          let urut = scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
          console.log(urut, 'ini scoresnya')
        
        io.to(payload.id.id).emit('finalScore', scores[0])
      }
    })
  })

});

http.listen(3000, () => {
  console.log('listening on *:3000')
})