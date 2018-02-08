//INITIAL CONFIGURATION

var express           = require('express')
var app = express();
var http = require('http').Server(app);
module.exports.io = require('socket.io')(http);
http.listen(5000);

require('./socket');
var http              = require('http')
var parseurl          = require('parseurl')
var cookieParser      = require('cookie-parser')
var session           = require('express-session')
var htmlspecialchars  = require('htmlspecialchars')
var bodyParser        = require('body-parser')
var mysql             = require('mysql')
var iplocate          = require('node-iplocate')
var faker             = require('faker');
var passwordHash      = require('password-hash');
const nodemailer      = require('nodemailer');
var EventEmitter      = require('events').EventEmitter;
var ev                = new EventEmitter();
var app               = express()
var port              = 8081
var con               = mysql.createConnection({
  host: "localhost",
  user:"root",
  password:"123456",
  database:"matcha"
})
server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent')
con.connect(function(err) {
  if (err) throw err
  console.log("✅  | Base de donnée OK")
})
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.use(cookieParser())
app.use(session({ secret: "Jean-michel crapaud, c'est lui, il est dans la river", resave: false, saveUninitialized: true}))

//USEFULL FUNCTIONS
function deg2rad(x){
  return Math.PI*x/180;
}
function getRandominInterval(min, max) {
  return Math.random() * (max - min) + min;
}
function _ago(status, ago) {
    var now = Math.floor(Date.now() / 1000);
    ago = Date.parse(ago)/1000
    var diff = now - ago
    if (status == 1 && diff < 600)
      return ("✅  Connecté")
    else if (diff < 60)
      return ("🔴 Déconnecté depuis " + Math.floor(diff) + " seconde" + (diff < 2 ? "" : "s"))
    else if (diff < 3600)
      return ("🔴 Déconnecté depuis " + Math.floor(diff / 60) + " minute" + (diff < 120 ? "" : "s"))
    else if (diff < 86400)
      return ("🔴 Déconnecté depuis " + Math.floor(diff / 3600) + " heure" + (diff < 7200 ? "" : "s"))
    else if (diff < 604800)
      return ("🔴 Déconnecté depuis " + Math.floor(diff / 86400) + " jour" + (diff < 172800 ? "" : "s"))
    else if (diff < 2592000)
      return ("🔴 Déconnecté depuis " + Math.floor(diff / 604800) + " semaine" + (diff < 1209600 ? "" : "s"))
    else if (diff < 31536000)
      return ("🔴 Déconnecté depuis " + Math.floor(diff / 2592000) + " mois")
    else
      return ("🔴 Déconnecté depuis " + Math.floor(diff / 31536000) + " an" + (diff < 63072000 ? "" : "s"))
}
function reset_status(id){
  var timeStamp = Math.floor(Date.now() / 1000);
  var sql       = "UPDATE `user` SET `status`= 1,`time`= CURRENT_TIMESTAMP WHERE id = " + id
  con.query(sql, function (err, result) {
    if (err)
      console.log(err)
  })
}
function reset_status_and_locate(id, lat, long, city){
  var timeStamp = Math.floor(Date.now() / 1000);
  var sql       = "UPDATE `user` SET `longitude`=" + long + ",`latitude`=" + lat + ",`ville`='" + city + "', `status`= 1,`time`= CURRENT_TIMESTAMP WHERE id = " + id
  con.query(sql, function (err, result) {
    if (err)
      console.log(err)
  })
}
function reset_status_disconnect(id){
  var timeStamp = Math.floor(Date.now() / 1000);
  var sql       = "UPDATE `user` SET `status`= 0,`time`= CURRENT_TIMESTAMP WHERE id = " + id
  con.query(sql, function (err, result) {
    if (err)
      console.log(err)
  })
}
function dateDiff(birthday){
  birthday = new Date(birthday);
  return new Number((new Date().getTime() - birthday.getTime()) / 31536000000).toFixed(0);

}
function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
function getFullLocationandrender(res, page){
  http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp)
  {
    var ip = resp.on('data', function(ip)
    {
      iplocate(ip).then((results) => {
        res.render(page, {long: results.longitude, lat:results.latitude})
      });
    });
  })
}
function addRandomTags(id){
  var sql2 = 'SELECT (count(id)) AS Nb FROM tags WHERE 1 < 2'
  con.query(sql2, function (err, result){
    tags_nb = result[0].Nb;
    n = getRandominInterval(2, 6)
    i = 0
    while (i < n)
    {
      var sql3 = "INSERT INTO `user_tag`(`id_tag`, `id_user`) VALUES (" + Math.round(getRandominInterval(0, tags_nb)) + ", " + id + ")"
      con.query(sql3, function (err, result) {
      })
      i++;
    }
  })

}
function addFakeAccounts(nb){
  var n = 0;
  var fake_img = [fs.readdirSync('public/wankuls/other'), fs.readdirSync('public/wankuls/homme'), fs.readdirSync('public/wankuls/femme')]
  faker.locale = "fr";
  while (n <= nb)
  {
    var sexe      = faker.random.number({min:0, max:2});
    var img1      = (sexe == 1 ? '/wankuls/homme/' : (sexe == 2 ? '/wankuls/femme/' : '/wankuls/other/')) + fake_img[sexe][faker.random.number({min:0, max:fake_img[sexe].length - 1})]
    var password  = passwordHash.generate(faker.internet.password(8, true), { algorithm: 'whirlpool', iterations: 42});
    faker.locale  = "en";
    var prenom    = faker.name.firstName(sexe == 1 ? 'male' : (sexe == 2 ? 'female' : ''))
    faker.locale  = "fr";
    var nom       = faker.name.lastName(0);
    var login     = faker.internet.userName(prenom, nom);
    var birthdate = faker.date.between('1945-01-01', '1999-12-31').toISOString().slice(0, 19).replace('T', ' ');
    var or_h      = faker.random.boolean();
    var or_f      = faker.random.boolean();
    var or_a      = (or_h || or_f ? faker.random.boolean() : true);
    var lat       = getRandominInterval(41.3565587, 50.545468);
    var long      = getRandominInterval(-5.235884, 9.567371);
    var city      = faker.address.city()
    var bio       = faker.lorem.paragraph();
    var email     = faker.internet.email(prenom, nom);
    var popularity= faker.random.number({min:40, max:1400});
    var status    = 0;
    var unlogged  = faker.date.recent(360).toISOString().slice(0, 19).replace('T', ' ');
    var values = "'" + login + "', '" + img1 + "', '" + password + "', '" + prenom + "', '" + nom + "', '" + birthdate + "', " + (or_h ? 1 : 0) + ", " + (or_f ? 1 : 0) + ", "
    values += (or_a ? 1 : 0) + ", " +  long + ", " + lat + ", '" +  city + "', " + sexe + ", '" + bio + "', '" + email + "', " + popularity + ", " + status + ", '" + unlogged + "')"
    sql = "INSERT INTO `user` (`login`, `img1`, `password`, `prenom`, `nom`, `birth_date`, `or_h`, `or_f`, `or_a`, `longitude`, `latitude`, `ville`, `sexe`, `bio`, `email`, `popularity`, `status`,`time`) VALUES ("
    if(prenom != "angelo")
    {
      con.query(sql + values, function (err, result){
        if (!(typeof result == "undefined" || result == null))
          addRandomTags(result.insertId);
      })
      n++;
    }
  }
}
function visit(src, dest){
  sql = "INSERT INTO `visite`(`id_visiteur`, `id_visite`) VALUES (" + src + " ," + dest + ")"
  con.query(sql, function(err, result){
  })
}
function vote(src, dest, value){
  var sql = ('SELECT id, value FROM vote WHERE id_src = ' + src + ' AND id_dst = ' + dest)
  con.query(sql, function (err, result) {
    if (err)
      console.log(err);
    if (result[0] || result.length != 0){
      if (result[0].value != value){
        var value_old = result[0].value
        con.query('DELETE FROM `vote` WHERE id_src = ' + src + ' AND id_dst = ' + dest + ' AND value = ' + result[0].value, function (err, result) {
          con.query('UPDATE `user` SET `popularity`=`popularity` - ' + value_old + ' WHERE `id` = ' + dest);
        })
      }
    }
    if (result.length == 0 || result[0].value != value)
    con.query("INSERT INTO `vote`(`id_src`, `id_dst`, `value`) VALUES (" + src + ", " + dest + "," + value + ")", function(err, result){
      con.query('UPDATE `user` SET `popularity`=`popularity` + ' + value + ' WHERE `id` = ' + dest);
    })
  })
}
function send_mail(from, to, subject, text){
    let transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
    });
    transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: text
    }, (err, info) => {
    });
};
// SOCKETS
io.sockets.on('connection', function (socket, id) {
  socket.on('init', function(id) {
    id = parseInt(id);
    socket.id = id;
});
  socket.on('vote', function (dest, value) {
    vote(socket.id, dest, value)
  });
});

// ROUTING
app.get('/install', function (req, res){
  console.log("⚙️  | Starting installation ")
  console.log("⚙️  | Tags creation ")
  var sql = 'INSERT INTO `tags` (`name`) VALUES ? '
  var values = [
    ['risitas'],
    ['jvc'],
    ['swag'],
    ['wankil'],
    ['tatoo'],
    ['geek'],
    ['lol'],
    ['minecraft'],
    ['lunette'],
    ['tacos'],
    ['siphano'],
    ['plante'],
    ['ecologie'],
    ['cordonbleu'],
    ['ananas'],
    ['love'],
    ['keke'],
    ['lovearmy'],
    ['japon'],
    ['lolita'],
    ['starwars'],
    ['netflix'],
    ['banane'],
    ['vinyle'],
    ['aspirateur'],
    ['corobizar'],
    ['lamasticot'],
    ['pgm'],
    ['brocoli']]
    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.affectedRows);
      console.log("✅  | Tags created ")
      console.log("⚙️  | Fake user creation")
      addFakeAccounts(1500)
      console.log("✅  | 1500 fake users created")
      console.log("✅  | Installation Done")
    });
    res.redirect('/');
})
app.get('/yesiamsureiwanttoresetthedatabase', function (req, res){
  con.query('TRUNCATE TABLE `blacklist`');
  con.query('TRUNCATE TABLE `message`');
  con.query('TRUNCATE TABLE `report`');
  con.query('TRUNCATE TABLE `tags`');
  con.query('TRUNCATE TABLE `user`');
  con.query('TRUNCATE TABLE `user_tag`');
  con.query('TRUNCATE TABLE `visite`');
  con.query('TRUNCATE TABLE `vote`');
  res.redirect('/install');
})
app.get('/addfakeaccount/:nb', function(req, res) {
  addFakeAccounts(req.params.nb)
})
app.get('/', function(req, res) {
  sess = req.session
  if (sess.user_id)
    res.render('home')
  else
    res.redirect('/connexion')
})
app.get('/offline', function(req, res) {res.render('offline-home')})
app.get('/profil/:username', function(req, res) {
  if (req.session.user_id != undefined)
  {
    sql = "SELECT id, login, prenom, ville, FLOOR(get_distance_metres('48.8966066', '2.318501400000059', latitude, longitude) / 1000) AS dist, nom, sexe, or_h, or_f, or_a, bio, popularity, status, time, img1, img2, img3, img4, img5, birth_date FROM user WHERE login = '" + escapeHtml(req.params.username) + "'"
    con.query(sql, function (err, result) {
      if (!result)
        res.render('error', {error: 31})
      else if (result.length == 1)
      {
        con.query("SELECT tags.name FROM tags INNER JOIN user_tag ON user_tag.id_tag = tags.id WHERE user_tag.id_user = " + result[0].id, function(err, tags)
        {
          visit(sess.user_id, result[0].id)
          result[0].birth_date = dateDiff(result[0].birth_date)
          result[0].time = _ago(result[0].status, result[0].time)
          var sql = "SELECT count(*) as nb FROM `vote` as `vote1`  LEFT OUTER JOIN `vote` as `vote2` ON `vote2`.`id_src` = `vote1`.`id_dst` AND vote2.value = 1 AND vote1.value = 1 AND vote2.id_dst = vote1.id_src WHERE vote1.id_src = " + result[0].id + " AND vote2.id_src = " + req.session.user_id
          con.query(sql, function (err, result2) {
            if (result2[0].nb == 0)
              res.render('user', {value: result[0], tags: tags, id: sess.user_id, matched:0})
            else
              res.render('user', {value: result[0], tags: tags, id: sess.user_id, matched:1})
          })
        })
      }
      else if (result.length == 0)
        res.render('error', {error: 31})
      else
        res.render('error', {error: 30})
    })
  }
  else
    res.redirect('/connexion')
})
app.get('/connexion', function(req, res){
  getFullLocationandrender(res, 'connexion')
})
app.get('/test', function(req, res){
  res.render('visite')
})
app.get('/inscription', function(req, res){
  getFullLocationandrender(res, 'inscription')})
app.get('/search', function(req, res){
  res.render('search')
})
app.get('/edit-profile', function(req, res){
  res.render('edit-profile')
})

app.get('/chat', function(req, res) {
  console.log(req.session.user_id);
  if (!req.session.user_id) {
    return res.redirect('/connexion');
  }
  // get users
  var sql = "SELECT user.id, user.login, user.nom, user.prenom, user.img1 FROM vote as vote1 LEFT OUTER JOIN vote as vote2 ON vote2.`id_src` = vote1.`id_dst` AND vote2.value = 1 AND vote1.value = 1 AND vote2.id_dst = vote1.id_src INNER JOIN user ON user.id = vote1.id_dst WHERE vote1.id_src=" + req.session.user_id
  con.query(sql, function (err, users) {
    console.log("[USER]", users);
    var match = users.filter(function (user) {
      return user.id == req.query.match;
    })[0];
    if (match === undefined && req.query.match !== undefined) {
      return res.redirect('/chat');
    }

    var sql2 ="SELECT * FROM `message` WHERE `id_src` IN (" + req.session.user_id + "," + req.query.match + ") AND `id_dst` IN (" + req.session.user_id + "," + req.query.match + ")"
    con.query(sql2, function(err, messages) {
      console.log(messages);
      res.render('chat', { userId: req.session.user_id, dstId: req.query.match || -1, users: users, match: match, messages: messages });
    })

  })

})

app.get('/test', function(req, res){
  req.session.user_id
  var sql = "SELECT visiteur FROM visites";
  con.query(sql, function(err, res) {
    res.render('visite', { visitors: res })
  })
})

app.get('/inscription', function(req, res){res.render('inscription')})

app.get('/search', function(req, res){res.render('search')})

app.get('/edit-profile', function(req, res){res.render('edit-profile')})

app.get('/favicon.ico', function(req, res) {})

app.post('/search-back', function(req, res){
  var sess          = req.session
  var post          = req.body
  var or_a          = (typeof post.or_a !== "undefined" && post.or_a !== null ? 1 : 0);
  var or_h          = (typeof post.or_h !== "undefined" && post.or_h !== null ? 1 : 0);
  var or_f          = (typeof post.or_f !== "undefined" && post.or_f !== null ? 1 : 0);
  var today         = new Date();
  var ageMin        = post.ageMin;
  var ageMax        = post.ageMax;
  var popMin        = parseInt(post.popMin);
  var distMax       = post.distMax
  var n             = 0;
  var sort          = post.sort;
  var tags          = post.tags.replace(/[ ]*/g, '').substr(1).split('#')
  var sql           = "SELECT DISTINCT user.id, user.login, user.ville, user.sexe, user.status, user.time, user.bio, user.popularity, user.birth_date, FLOOR(get_distance_metres('48.8966066', '2.318501400000059', latitude, longitude) / 1000) dist, img1 FROM user " + (post.tags != "" ? " INNER JOIN user_tag ON user_tag.id_user = user.id INNER JOIN tags ON user_tag.id_tag = tags.id" : "") + " WHERE "
  if (or_h + or_f + or_a != 0)
  {
    sql+="("
    if (or_h == 1)  {
      sql += (n != 0 ? " AND " : "") + " user.sexe = 1 "
      n++;
    }
    if (or_f == 1)  {
      sql += (or_h != 0 ? " OR " : (n != 0 ? " AND " : "")) + " user.sexe = 2 "
      n++;
    }
    if (or_a == 1)  {
      sql += (or_h + or_f != 0 ? " OR " : (n != 0 ? " AND " : "")) + " user.sexe = 0 "
      n++;
    }
    sql += ")"
  }
  if (ageMin != "" && ageMax != "")
  {
    var birthdateMin  = new Date();
    var birthdateMax  = new Date();
    birthdateMin.setDate(today.getDate() - (365 * parseInt(ageMax)))
    birthdateMax.setDate(today.getDate() - (365 * parseInt(ageMin)))
    sql += (or_h + or_f + or_a != 0 ?  " AND " : "") + "(birth_date BETWEEN '" + birthdateMin.toISOString().substring(0, 10) + "' AND '" + birthdateMax.toISOString().substring(0, 10) + "')"
  }
  else if (ageMin == "" && ageMax != "")
  {
    var birthdateMin  = new Date();
    birthdateMin.setDate(today.getDate() - (365 * parseInt(ageMax)))
    sql += (or_h + or_f + or_a != 0 ?  " AND " : "") + "(birth_date >= '" + birthdateMin.toISOString().substring(0, 10) + "')"
  }
  else if (ageMin != "" && ageMax == "")
  {
    var birthdateMax  = new Date();
    birthdateMax.setDate(today.getDate() - (365 * parseInt(ageMin)))
    sql += (or_h + or_f + or_a != 0 ?  " AND " : "") + "(birth_date <= '" + birthdateMax.toISOString().substring(0, 10) + "')"
  }
  if (!isNaN(popMin))  {
    sql += (or_h + or_f + or_a != 0 || ageMin != "" || ageMax != "" ?  " AND " : "") + " user.popularity > " + popMin
    n++;
  }
  if (post.tags != "")
  {
    tags.forEach(function(element) {
      sql += (or_h + or_f + or_a != 0 || ageMin != "" || ageMax != "" || !isNaN(popMin) ? " AND " : "") + "tags.name = '" + element + "'"
      n++;
    });
  }
  if ((or_h + or_f + or_a == 0 && ageMin == "" && ageMax == "" && isNaN(popMin) && post.tags == ""))
    sql += "1"
  if (distMax != "" && !isNaN(distMax))
    sql += " HAVING DIST > " + distMax
  if (sort == "pop")
    sql+= " ORDER BY popularity DESC, dist ASC, birth_date DESC"
  else if (sort == "age")
    sql+=" ORDER BY birth_date DESC, popularity DESC, dist ASC"
  else if (sort == "dist")
    sql+=" ORDER BY dist ASC, popularity DESC, birth_date DESC"
  con.query(sql, function (err, result) {
    if (err) throw err
    if (result.length == 0)
      res.render('search')
    else{
    for (var j = 0; j < 10 && j < result.length; j++) {
      result[j].status = _ago(result[j].status, result[j].time)
      result[j].birth_date = dateDiff(result[j].birth_date)
    }
    res.render('result-search', {values: result, initialdata: req.body, nbresult:result.length})
  }})
})
app.post('/inscription-back',function(req,res){
  var sess          = req.session
  var post          = req.body
  var Regexpassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$/g
  var Regexemail    = /^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$/g
  if (post.pseudo && post.passwd && post.email && post.prenom && post.nom)
  {
    var pseudo      = htmlspecialchars(post.pseudo)      
    var password    = htmlspecialchars(post.passwd)
    var email       = htmlspecialchars(post.email)
    var prenom      = htmlspecialchars(post.prenom)
    var nom         = htmlspecialchars(post.nom)

    //Vérification données
    if (pseudo.length < 3)
      res.render('error', {error: 1})
    else if (pseudo.length > 24)
      res.render('error', {error: 2})
    else if (password.length < 6)
      res.render('error', {error: 4})
    else if (password.length > 36)
      res.render('error', {error: 5})
    else if (!(Regexpassword.test(password)))
      res.render('error', {error: 6})
    else if (!(Regexemail.test(email)))
      res.render('error', {error: 7})
    else if (prenom.length > 36)
      res.render('error', {error: 9})
    else if (nom.length > 36)
      res.render('error', {error: 10})
    else {
    //Vérification pseudo email
      var sql = "SELECT count(id) AS nb FROM user WHERE login = '" + pseudo + "'"
      con.query(sql, function (err, result) {
        if (result[0].nb > 0)
          res.render('error', {error: 3})
        else {
          var sql = "SELECT count(id) AS nb FROM user WHERE email = '" + email + "'"
          con.query(sql, function (err, result) {
            if (result[0].nb > 0)
              res.render('error', {error: 8})
            else {
              var sql = "INSERT INTO user (login, password, email, prenom, nom) VALUES ?"
              var values = [[pseudo,  passwordHash.generate(password, { algorithm: 'whirlpool', iterations: 42}), email, prenom, nom]]
              con.query(sql, [values], function (err, result) {
                if (err) throw err
                console.log("😀  | " + pseudo + " a créé un compte")
                req.session.user_id = result.insertId
                res.redirect('/')
                reset_status_and_locate(sess.user_id, req.body.latitude, req.body.longitude, req.body.city)
               })
            }
          })
        }
      })
    }
  }
    else
      res.render('error', {error: 11})
})
app.post('/connexion-back',function(req,res){
  var sess = req.session
  var username = escapeHtml(req.body.username)
  var password = req.body.mdp
  console.log(passwordHash.generate(password, {algorithm: 'whirlpool'}))
  var sql = "SELECT id, password FROM user WHERE login = '" + username + "'";
  con.query(sql, function (err, result) {
    if (err)
      console.log(err);
    else if (result.length == 1) //SUCCESS
    {
      if (passwordHash.verify(req.body.mdp, result[0].password))
      {
        sess.user_id = result[0].id;
        reset_status_and_locate(sess.user_id, req.body.latitude, req.body.longitude, req.body.city)
        console.log("✅  | " + username + " s'est connecté");
        res.redirect('/')
      }
      else
        res.render('error', {error: 22})
    }
    else if (result.length > 1)
    {
      res.render('error', {error: 21})
      console.log("⁉️  | Il y a " + result.length + " comptes nommés " + username)
    }
    else if (result.length == 0) // FAIL
    {
      res.render('error', {error: 20})
      console.log("⚠️  | " + username + " n'as pas réussi a se connecter")
    }
  })
})
app.get('/logout',function(req,res){
  var sess = req.session;
  var id = req.session.user_id;
  var sql = "SELECT login FROM user WHERE id = " + id;
  con.query(sql, function (err, result) {
    req.session.destroy(function(err) {
      if(err)
        console.log(err)
      else
      {
        reset_status_disconnect(id);
        res.redirect('/')
      }
    })
  })
})
//TCHAT

//A LAISSER EN DERNIER

app.use(function(req, res, next){
  res.render('404')})
server.listen(port)
console.log("✅  | Listening on port " + port)
