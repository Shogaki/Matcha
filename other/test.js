var n             = 0
var or_h          = 0 //H F ou A
var or_f          = 1
var or_a          = 0
var ageMin        = parseInt(12);
var ageMax        = parseInt("");
var popMin        = parseInt(40);
var popMax        = parseInt("f");
var tagslist      = "#poulet #lol #fun #delire".replace('/[ ]*/','//')
console.log(tagslist)
var tags           = /(?:(?<=\#))([^#]*)/.
if (or_a + or_f + or_h == 0){
  console.log('sexe non specifié')
else {
  var sql           = "SELECT * FROM user " + (tags.lenght != 0 ? "INNER JOIN user_tag ON user_tag.id_user = user.id INNER JOIN tags ON user_tag.id_tag = tags.id" : "") + " WHERE "
  if (or_h == 1)  {
    sql += (n != 0 ? " AND " : "") + " user.sexe = 1 "
    n++;
  }
  if (or_f == 1)  {
    sql += (or_h != 0 ? OR : (n != 0 ? " AND " : "")) + " user.sexe = 2 "
    n++;
  }
  if (or_a == 1)  {
    sql += (or_h + or_f != 0 ? "OR" : (n != 0 ? " AND " : "")) + " user.sexe = 0 "
    n++;
  }
  if (!isNaN(ageMin))  {
    sql += (n != 0 ? " AND " : "") + " user.age > " + ageMin
    n++;
  }
  if (!isNaN(ageMax))  {
    sql += (n != 0 ? " AND " : "") + " user.age < " + ageMax
    n++;
  }
  if (!isNaN(popMin))  {
    sql += (n != 0 ? " AND " : "") + " user.popularity > " + popMin
    n++;
  }
  if (!isNaN(popMax))  {
    sql += (n != 0 ? " AND " : "") + " user.popularity < " + popMax
    n++;
  }
  tags.forEach(function(element) {
    sql += (n != 0 ? " AND " : "") + "tags.name = '" + element + "'"
    n++;
  });
}
console.log(sql);


if preg_match('/([ ]*)/', $str, $m)
  {
    $str = preg_replace('/[ ]*/','//', $str);
  }

  preg_match('/(?:(?<=\#))([^#]*)/', $str, $m);
  preg_match_all('/(?:(?<=\#))([^#]*)/', $str, $m)

  preg_match_all('/(?:(?<=\#))([^#]*)/', preg_replace('/[ ]*/','//', $str), $m)
