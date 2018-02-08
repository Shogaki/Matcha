var mysql             = require('mysql')
var con               = mysql.createConnection({
  host: "localhost",
  user:"root",
  password:"123456",
  database:"matcha"
})
var io = require('./index').io;
// console.log('inin');
// io.on('connection', function(socket){
//   console.log('whatever');
// });
//
// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });

// con.query("SELECT ", function (err, result) {
//   if (err)
//     console.log(err)
// })

io.on('connection', function (socket) {
  console.log('connected');
  socket.on('message', function (message) {
    io.emit(message.channel, message)
    var sql = "INSERT INTO message (id_src, id_dst, text) VALUES ?"
    var ids = message.channel.split('-');
    var values = [[ids[0], ids[1], message.message]];
    con.query(sql,[values], function (err, resul) {
      if (err) throw err;
    })
  })
});
