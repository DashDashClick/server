const express = require('express')
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const { Room } = require('./models')

app.get('/', function(req, res){
  console.log('masup pak');
});
app.use(express.json()) 
app.use(express.urlencoded({extended: false}))
var cors = require('cors')
app.use(cors())

const images = [
  'https://i.ytimg.com/vi/zB5dlqSds3k/maxresdefault.jpg',
  'https://scstylecaster.files.wordpress.com/2019/10/pretty-in-pink-1.jpg',
  'https://purewows3.imgix.net/images/articles/2017_05/Heathers.jpg?auto=format,compress&cs=strip'
]

let scores = []

io.on('connection', function(socket){

  io.emit('gambar', images)
  console.log('a user connected');
  socket.on('hai', (mand)=>{
    if(mand == 'next'){
    io.emit('hai', +1)
    }else{
    io.emit('hai', -1)
    }
  })

  socket.on('createRoom', (payload) => {
    Room.create({
      name: payload.roomName
    })
      .then(room => {
        socket.join(room.id, (err) => {
          if(err) {
            console.log(err)
          } else {
            console.log('room created')
            io.emit('roomCreated', room)
          }
        })
      })
  })

  socket.on('fetchRoom', ()=>{
    Room.findAll()
      .then(rooms => {
        socket.emit('showRooms', rooms)
      })
  })

  socket.on('joinRoom', (payload)=>{
    socket.join(payload.id,()=>{
      io.to(payload.id).emit('joined', payload)
      scores = []
    })
  })
  
  socket.on('inGame', (payload)=>{
    socket.join(payload.id.id,()=>{
      // io.to(payload.id).emit('joined', payload)
      scores.push(payload)
      console.log(scores.length, 'ini panjangnya');
      console.log(scores, 'ini scorenya');
      if(scores.length > 1){
        // scores.sort(function(a, b) {
          //   return b[1] - a[1];
          // });
          let urut = scores.sort((a, b) => (a.score < b.score) ? 1 : -1)
          console.log(urut, 'ini scoresnya');
        
          if(urut[0].score == urut[1].score && urut[0].username !== urut[1].username){
            io.to(payload.id.id).emit('finalScore', scores[0], 'draw')
          }else{
            io.to(payload.id.id).emit('finalScore', scores[0], 'pemenangnya')
          }
      }
    })
  })

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});