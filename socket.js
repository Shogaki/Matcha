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

  function new_notification(type, src, dest){
    if (!isNaN(type) && !isNaN(src) && !isNaN(dest))
    {
      send_push_notification(type, src, dest)
      var sql = "INSERT INTO `notification`(`src`, `dst`, `type`) VALUES ('" + src + "','" + dest + "','" + type + "')"
      con.query(sql)
    }

  }
  function send_push_notification(type, src, dest){
    sql = "SELECT login FROM user WHERE id = " + src
    con.query(sql, function(err, res){
      if (res.length == 1){
        console.log("Notif envoyée")
        socket.broadcast.emit("notif" + dest, src, res[0].login, type);
      }
    })
  }

  console.log('connected');
  socket.on('message', function (message) {
    io.emit(message.channel, message)
    var sql = "INSERT INTO message (id_src, id_dst, text) VALUES ?"
    var ids = message.channel.split('-');
    var values = [[ids[0], ids[1], message.message]];
    con.query(sql,[values], function (err, resul) {
      new_notification(1, values[0], values[1])
      send_push_notification(1, values[0], values[1])
      if (err) throw err;
    })
  })
});
