var express           = require('express')
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
var app               = express()
var port              = 8081
var con               = mysql.createConnection({
  host: "localhost",
  user:"root",
  password:"123456",
  database:"matcha"
})
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
      return ("✅  ")
    else if (diff < 60)
      return ("🔴 depuis " + Math.floor(diff) + " seconde" + (diff < 2 ? "" : "s"))
    else if (diff < 3600)
      return ("🔴 depuis " + Math.floor(diff / 60) + " minute" + (diff < 120 ? "" : "s"))
    else if (diff < 86400)
      return ("🔴 depuis " + Math.floor(diff / 3600) + " heure" + (diff < 7200 ? "" : "s"))
    else if (diff < 604800)
      return ("🔴 depuis " + Math.floor(diff / 86400) + " jour" + (diff < 172800 ? "" : "s"))
    else if (diff < 2592000)
      return ("🔴 depuis " + Math.floor(diff / 604800) + " semaine" + (diff < 1209600 ? "" : "s"))
    else if (diff < 31536000)
      return ("🔴 depuis " + Math.floor(diff / 2592000) + " mois")
    else
      return ("🔴 depuis " + Math.floor(diff / 31536000) + " an" + (diff < 63072000 ? "" : "s"))
}
function reset_status(id, latitude, longitude){
  var timeStamp = Math.floor(Date.now() / 1000);
  var sql       = "UPDATE `user` SET `status`= 1,`time`= CURRENT_TIMESTAMP WHERE id = " + id
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
function show_status(id){
  var timeStamp = Math.floor(Date.now() / 1000);
  var sql       = "SELECT status, time FROM user WHERE id = " + id
  con.query(sql, function (err, result) {
    time = result[0].time;
    status = result[0].status;

    if (status == 0 || time >= timeStamp + 600)
      console.log("🛑 Déconnecté " + _ago(time))
    else {
      console.log("✅ Connecté")
    }
  });
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
  sql = 'SELECT (count(id)) AS Nb FROM tags WHERE 1 < 2'
  con.query(sql, function (err, result){
    tags_nb = result[0].Nb;
    n = getRandominInterval(2, 6)
    i = 0
    while (i < n)
    {
      sql = "INSERT INTO `user_tag`(`id_tag`, `id_user`) VALUES (" + Math.round(getRandominInterval(0, tags_nb)) + ", " + id + ")"
      con.query(sql, function (err, result) {
      })
      i++;
    }
  })

}
function addFakeAccounts(nb){
  var n = 0;

  faker.locale = "fr";
  while (n <= nb)
  {
    var password  = faker.internet.password(8, true);
    faker.locale = "en";
    var prenom    = faker.name.firstName(0);
    faker.locale = "fr";
    var nom       = faker.name.lastName(0);
    var login     = faker.internet.userName(prenom, nom);
    var birthdate = faker.date.between('1945-01-01', '1999-12-31').toISOString().slice(0, 19).replace('T', ' ');
    var or_h      = faker.random.boolean();
    var or_f      = faker.random.boolean();
    var or_a      = (or_h || or_f ? faker.random.boolean() : true);
    var lat       = getRandominInterval(41.3565587, 50.545468);
    var long      = getRandominInterval(-5.235884, 9.567371);
    var city      = faker.address.city()
    var sexe      = faker.random.number({min:0, max:2});
    var bio       = faker.lorem.paragraph();
    var email     = faker.internet.email(prenom, nom);
    var popularity= faker.random.number({min:40, max:1500});
    var status    = 0;
    var unlogged  = faker.date.recent(360).toISOString().slice(0, 19).replace('T', ' ');
    var values = "'" + login + "', '" + password + "', '" + prenom + "', '" + nom + "', '" + birthdate + "', " + (or_h ? 1 : 0) + ", " + (or_f ? 1 : 0) + ", "
    values += (or_a ? 1 : 0) + ", " +  long + ", " + lat + ", '" +  city + "', " + sexe + ", '" + bio + "', '" + email + "', " + popularity + ", " + status + ", '" + unlogged + "')"
    sql = "INSERT INTO `user` (`login`, `password`, `prenom`, `nom`, `birth_date`, `or_h`, `or_f`, `or_a`, `longitude`, `latitude`, `ville`, `sexe`, `bio`, `email`, `popularity`, `status`,`time`) VALUES ("
    if(prenom != "angelo")
    {
      con.query(sql + values, function (err, result){
        if (!(typeof result == "undefined" || result == null))
          addRandomTags(result.insertId);
        else
          console.log(sql + values);
      })
      n++;
    }
  }
}

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
    ['triste'],
    ['suicide'],
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
    ['strmwood'],
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

})
app.get('/addfakeaccount/:nb', function(req, res) {
  addFakeAccounts(req.params.nb)
})

// FRONT
app.get('/', function(req, res) {
  sess = req.session
  if (sess.user_id)
    res.render('home')
  else
    getFullLocationandrender(res, 'connexion')
})
app.get('/offline', function(req, res) {res.render('offline-home')})
app.get('/profil/:username', function(req, res) {
  sql = "SELECT id, login, prenom, nom, sexe, or_h, or_f, or_a, bio, popularity, status, UNIX_TIMESTAMP(time) AS time FROM user WHERE login = '" + escapeHtml(req.params.username) + "'"
  con.query(sql, function (err, result) {
    if (!result)
      res.render('error', {error: 31})
    else if (result.length == 1){
      if (result[0].status == 0)
        result[0].time = _ago(result[0].time)
      else if (result[0].time + 600 < (Math.floor(Date.now() / 1000)))
      {
        result[0].status = 0;
        result[0].time = _ago(result[0].time)
      }
      res.render('user', {value: result[0]})
    }
    else if (result.length == 0){
      res.render('error', {error: 31})
    }
    else {
      res.render('error', {error: 30})
    }
  })
})
app.get('/connexion', function(req, res){
  getFullLocationandrender(res, 'connexion')
})
app.get('/test', function(req, res){res.render('visite')})
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
  var tags          = post.tags.replace(/[ ]*/g, '').substr(1).split('#')
  if (or_a + or_f + or_h == 0)
    res.render('error', {error: 40})
  else {
    var sql           = "SELECT DISTINCT user.login, user.ville, user.sexe, user.status, user.time, user.bio, user.popularity, user.birth_date, FLOOR(get_distance_metres('48.8966066', '2.318501400000059', latitude, longitude) / 1000) dist FROM user " + (post.tags != "" ? " INNER JOIN user_tag ON user_tag.id_user = user.id INNER JOIN tags ON user_tag.id_tag = tags.id" : "") + " WHERE ("
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
    if (ageMin != "" && ageMax != "")
    {
      var birthdateMin  = new Date();
      var birthdateMax  = new Date();
      birthdateMin.setDate(today.getDate() - (365 * parseInt(ageMax)))
      birthdateMax.setDate(today.getDate() - (365 * parseInt(ageMin)))
      sql += " AND (birth_date BETWEEN '" + birthdateMin.toISOString().substring(0, 10) + "' AND '" + birthdateMax.toISOString().substring(0, 10) + "')"
    }
    else if (ageMin == "" && ageMax != "")
    {
      var birthdateMin  = new Date();
      birthdateMin.setDate(today.getDate() - (365 * parseInt(ageMax)))
      sql += " AND (birth_date >= '" + birthdateMin.toISOString().substring(0, 10) + "')"
    }
    else if (ageMin != "" && ageMax == "")
    {
      var birthdateMax  = new Date();
      birthdateMax.setDate(today.getDate() - (365 * parseInt(ageMin)))
      sql += " AND (birth_date <= '" + birthdateMax.toISOString().substring(0, 10) + "')"
    }
    if (!isNaN(popMin))  {
      sql += (n != 0 ? " AND " : "") + " user.popularity > " + popMin
      n++;
    }
    if (post.tags != "")
    {
      tags.forEach(function(element) {
        sql += (n != 0 ? " AND " : "") + "tags.name = '" + element + "'"
        n++;
      });
    }
    if (distMax != "" && !isNaN(distMax))
        sql += " HAVING DIST > " + distMax
    sql+= " ORDER BY popularity DESC, dist ASC LIMIT 1, 10"
  }
  console.log(sql);
  con.query(sql, function (err, result) {
    if (err) throw err
    if (result.length == 0)
      res.render('search')
    else{
    for (var j = 0; j < 10 && j < result.length; j++) {
      console.log(result[j].login)
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
              var values = [[pseudo, password, email, prenom, nom]]
              con.query(sql, [values], function (err, result) {
                if (err) throw err
                console.log("😀  | " + pseudo + " a créé un compte")
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
  var sql = "SELECT id FROM user WHERE login = '" + username + "' AND password = '" + password + "'";
  con.query(sql, function (err, result) {
    if (err)
      console.log(err);
    else if (result.length == 1) //SUCCESS
    {
      sess.user_id = result[0].id;
      reset_status(sess.user_id)
      console.log("✅  | " + username + " s'est connecté");
      res.redirect('/')
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

//A LAISSER EN DERNIER
app.listen(port)
app.use(function(req, res, next){ res.render('404')})
console.log("✅  | Serveur HTTP OK")
console.log("✅  | Port " + port)
