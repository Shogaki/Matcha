var faker = require('faker');
var n = 0;

faker.locale = "en";

while (n <= 1000000000)
{
  var password  = faker.internet.password(8, true);
  faker.locale = "en";
  var prenom    = faker.name.firstName(0);
  faker.locale = "fr";
  var nom       = faker.name.lastName(0);
  var login     = faker.internet.userName(prenom, nom);
  var birthdate = faker.date.past(60)
  var img1      = faker.image.people(200, 200)
  var img2      = faker.image.people(200, 200)
  var img3      = faker.image.people(200, 200)
  var img4      = faker.image.people(200, 200)
  var img5      = faker.image.people(200, 200)
  var or_h      = faker.random.boolean();
  var or_f      = faker.random.boolean();
  var or_a      = (or_h || or_f ? faker.random.boolean() : true);
  var long      = faker.address.longitude()
  var lat       = faker.address.latitude();
  var city      = faker.address.city()
  var sexe      = faker.random.number({min:0, max:2});
  var bio       = faker.lorem.paragraph();
  var email     = faker.internet.email(prenom, nom);
  var popularity= faker.random.number({min:0, max:1500});
  var status    = 0;
  var unlogged  = faker.date.recent(360)
  console.log("***************************USER " + n)
  console.log("login      : " + login)
  console.log("prenom     : " + prenom)
  console.log("nom        : " + nom)
  console.log("naissance  : " + birthdate)
  console.log("sexe       : " + sexe)
/*  console.log("img      : " + img1)
  console.log("img        : " + img2)
  console.log("img        : " + img3)
  console.log("img        : " + img4)
  console.log("img        : " + img5)
*/
  console.log("Rech Homme : " + or_h)
  console.log("Rech Femme : " + or_f)
  console.log("Rech Autre : " + or_a)
  console.log("password   : " + password)
  console.log("longitude  : " + long)
  console.log("latitude   : " + lat)
  console.log("city       : " + city)
  console.log("bio        : " + bio)
  console.log("email      : " + email)
  console.log("unlogged   : " + unlogged)
  console.log("popularity : " + popularity)
  n++;
}
