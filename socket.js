var mysql             = require('mysql')
var htmlspecialchars  = require('htmlspecialchars')
var con               = mysql.createConnection({
  host: "localhost",
  user:"root",
  password:"123456",
  database:"matcha"
})
var io = require('./index').io;

io.on('connection', function (socket) {
  socket.on('nonlu', function(id){
    id = parseInt(id);
    socket.id = id;
    var sql = "SELECT count(id) as msg FROM message WHERE new = 1 AND id_dst = " + id
    con.query(sql, function(err, result)
    {
      if (result !== undefined)
      {
        var msg = result[0].msg;
        var sql = "SELECT count(id) as notif FROM notification WHERE new = 1 AND dst = " + id
        con.query(sql, function(err, result){
          if (result !== undefined)
          {
            var notif = result[0].notif;
            socket.emit('nonlu', msg, notif);
          }
        })
      }
    })
  })
  socket.on('init', function(id, id_dest) {
    id = parseInt(id);
    socket.id = id;
    new_notification(1, id, id_dest)
    send_push_notification(1, id, id_dest)
  });
  socket.on('vote', function (dest, value) {
    con.query('SELECT id, value FROM vote WHERE id_src = ' + socket.id + ' AND id_dst = ' + dest, function (err, result)
    {
      con.query('SELECT count(*) as nb FROM `vote` as `vote1` LEFT OUTER JOIN `vote` as `vote2` ON `vote2`.`id_src` = `vote1`.`id_dst` AND vote2.value = 1 AND vote1.value = 1 AND vote2.id_dst = vote1.id_src WHERE vote1.id_src = ' + socket.id + ' AND vote2.id_src = ' + dest, function (err, result2)
      {
        var was_matched = (result2 && result2[0] && result2[0].nb == 1 ? 1 : 0)
        if (result[0] || result.length != 0)
        {
          if (result[0].value != value)
          {
            var value_old = result[0].value
            con.query('DELETE FROM `vote` WHERE id_src = ' + socket.id + ' AND id_dst = ' + dest + ' AND value = ' + result[0].value, function (err, result)
            {
              con.query('UPDATE `user` SET `popularity`=`popularity` - ' + value_old + ' WHERE `id` = ' + dest);
            })
          }
          else {
            con.query('DELETE FROM `vote` WHERE id_src = ' + socket.id + ' AND id_dst = ' + dest + ' AND value = ' + result[0].value, function (err, result){         })

        }
      }
        if (result.length == 0 || result[0].value != value)
        {
          con.query("INSERT INTO `vote`(`id_src`, `id_dst`, `value`) VALUES (" + socket.id + ", " + dest + "," + value + ")", function(err, result)
          {
            con.query('UPDATE `user` SET `popularity`=`popularity` + ' + value + ' WHERE `id` = ' + dest, function(err, res)
            {
              if (value == 1){
                new_notification(0, socket.id, dest)
                send_push_notification(0, socket.id, dest)
              }
            })
          });
        }
        con.query('SELECT count(*) as nb FROM `vote` as `vote1` LEFT OUTER JOIN `vote` as `vote2` ON `vote2`.`id_src` = `vote1`.`id_dst` AND vote2.value = 1 AND vote1.value = 1 AND vote2.id_dst = vote1.id_src WHERE vote1.id_src = ' + socket.id + ' AND vote2.id_src = ' + dest, function (err, result3)
        {
          var is_matched = (result3 && result3[0] && result3[0].nb == 1 ? 1 : 0)
          if (was_matched == 0 && is_matched == 1)
          {
            new_notification(3, socket.id, dest)
            send_push_notification(3, socket.id, dest)
          }
          else if (was_matched == 1 && is_matched == 0)
          {
            new_notification(4, socket.id, dest)
            send_push_notification(4, socket.id, dest)
          }
        })
      })
    })
  });
    function new_notification(type, src, dest){
      if (!isNaN(type) && !isNaN(src) && !isNaN(dest))
      {
        var sql = "INSERT INTO `notification`(`src`, `dst`, `type`) VALUES ('" + src + "','" + dest + "','" + type + "')"
        con.query(sql)
      }

    }
  function send_push_notification(type, src, dest){
    sql = "SELECT login FROM user WHERE id = " + src
    con.query(sql, function(err, res){
      if (res.length == 1){
        socket.broadcast.emit("notif" + dest, src, res[0].login, type);
      }
    })
  }
  socket.on('message', function (message) {
    message.message = htmlspecialchars(message.message);
    if (message.message.length < 1024)
    {
    io.emit(message.channel, message)
    var sql = "INSERT INTO message (id_src, id_dst, text) VALUES ?"
    var ids = message.channel.split('-');
    var values = [[ids[0], ids[1], message.message]];
    con.query(sql,[values], function (err, resul) {
      new_notification(2, ids[0], ids[1])
      send_push_notification(2, ids[0], ids[1])
      if (err) throw err;
    })
  }
})
});
