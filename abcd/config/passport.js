var passport   = require('passport');
var LocalStrategy = require('passport-local').Strategy;





//   MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host     : 'localhost',
    user     : 'root',
    password : 'qhqud100!@',
    database : 'my_db'
});

// serialize & deserialize User // 2
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
 done(null, user.name);
});

passport.deserializeUser(function(id, done) {
  console.log('dserializeUser', id);
  pool.getConnection(function (err, connection) {
  connection.query("select * from tbl_users where name = ?", id, function(err, rows){

    var user = rows[0];
    done(err, user);
    connection.release();
 });
});
});



// local strategy // 3
passport.use(new LocalStrategy({
   usernameField : "username", // 3-1
   passwordField : "password"
 }, function(username, password, done) {

   pool.getConnection(function (err, connection) {

      // 3-2
    connection.query ("select * from tbl_users where name = ?", username, function(err, rows){
      var user = rows[0];
      if(err) {
        console.log(1);
        return done(err);

      }
      if(!user) {
        return done(null, false, {message: '없는 아이디' });

      }
      if (user.password !== password) {
        return done(null, false, {message : '비번 다시'});

      }
      console.log(4);
      return done(null, user);
      connection.release();



    });
  });
  }));

module.exports = passport;
