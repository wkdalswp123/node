var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var passport = require('../config/passport');
var session = require('express-session');

//   MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host     : 'localhost',
    user     : 'root',
    password : 'qhqud100!@',
    database : 'my_db'
});




router.get('/welcome', function (req, res, next) {
    res.render('board1/welcome');
});


router.post('/welcome', function (req, res, next) {
      var data = [req.body.userId, req.body.userPw];
      console.log("rows : " + data);

      pool.getConnection(function (err, connection) {
        var sql = "insert into tbl_users (name, password) values (?,?)";
        connection.query(sql, data, function(err, rows) {

            if(err) { throw err;}
            console.log("Data inserted!");
            res.redirect('/board1/welcome');
            connection.release();
          });
      });
});

/*
router.post('/login', function (req, res, next) {
      var id = req.body.username;
      var pw = req.body.password;

      var sql = 'select * from tbl_users where name=?';

      pool.getConnection(function (err, connection) {
        connection.query(sql, [id] , function(err, rows) {
            if(err)
              console.log(err);
            if(!rows[0])
              return res.send('please check your id');
            var user = rows[0];
            if(user.password == [pw]){
              req.session.is_logined = true;
              req.session.name = user.name;

              res.render('index', {row: rows[0]});

              console.log("로그인 성공!\n");
              console.log("id =" + [id] + "  pw =" + [pw] );
              res.redirect('/');
            }
            else {

              return res.send('plase check your password');
            }
          });
      });
});
*/

router.get('/login',  function (req, res, next) {

    res.render('board1/login');
});



router.post('/login',
 passport.authenticate('local', {
  successRedirect : '/board1',
  failureRedirect : '/board1/login'
 }
));

router.get("/logout", function(req, res) {
 req.logout();
 res.redirect("/board1");
});


//잠깐만 페이징 구현

router.get('/list', function(req,res,next){
    pool.getConnection(function (err, connection) {
        var sql = "SELECT B.BRDNO, B.BRDTITLE, U.name,  DATE_FORMAT(BRDDATE,'%Y-%m-%d') BRDDATE FROM TBL_BOARD AS B JOIN TBL_USERS AS U ON B.brdWRITER = U.id;";
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);
//            console.log("rows : " + JSON.stringify(rows));

            res.render('board1/list', {rows: rows?rows:{}});
            connection.release();
        });
    });
});
/*
router.get('/bye', function(req,res,next){
    var data = req.user.id;

    pool.getConnection(function (err, connection) {
            var sql = "delete from tbl_board where brdwriter id = ?" ;
            var sql2 = "delete from tbl_users where id = ?" ;

            connection.query(sql,data ,sql2, data, function (err, rows) {
                if (err) console.error("err : " + err);

                res.redirect('/board1/list');
                connection.release();
            });
    });
});*/



router.get('/search', function(req,res,next){
    var dt = req.query.searchWord;

    console.log("rows : " + dt);
    pool.getConnection(function (err, connection) {
        var sql = "SELECT B.BRDNO, B.BRDTITLE, U.name,  DATE_FORMAT(BRDDATE,'%Y-%m-%d') BRDDATE FROM TBL_BOARD AS B JOIN TBL_USERS AS U ON U.id = b.brdwriter and U.NAME = ? order by B.brdno DESC";
        connection.query(sql, dt, function (err, rows) {
            if (err) console.error("err : " + err);
//            console.log("rows : " + JSON.stringify(rows));

            res.render('board1/search', {rows: rows?rows:{}});
            connection.release();
        });
    });
});
/*
router.get('/list/:cur', function(req,res,next){

    var page_size = 10;
    var page_list_size = 3;
    var no = "";
    var totalPageCount = 0;


    pool.getConnection(function (err, connection) {
        var sql = "select count(*) as cnt from tbl_board";
        connection.query(sql, function (err, rows) {
            if (err){
              console.error("err : " + err);
              return
            }

            totalPageCount = rows[0].cnt;
            var curPage = req.params.cur;

            if(totalPageCount <0) {
              totalPageCount = 0;
            }



//            console.log("rows : " + JSON.stringify(rows));

            res.render('board1/list', {rows: rows?rows:{}});
            connection.release();
        });
    });
});*/

router.get('/read', function(req,res,next){
    pool.getConnection(function (err, connection) {
        var sql = "SELECT B.BRDNO, B.BRDTITLE, BRDMEMO, U.name,  DATE_FORMAT(BRDDATE,'%Y-%m-%d') BRDDATE FROM TBL_BOARD AS B JOIN TBL_USERS AS U WHERE B.brdWRITER = U.id AND BRDNO=" + req.query.brdno;
            console.log("rows : " + sql);
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('board1/read', {row: rows[0]});
            connection.release();
        });
    });
});

router.get('/form', function(req,res,next){
    if (!req.query.brdno) {
        res.render('board1/form', {row: ""});
        return;
    }
    pool.getConnection(function (err, connection) {
        var sql = "SELECT BRDNO, BRDTITLE, BRDMEMO, BRDWRITER, DATE_FORMAT(BRDDATE,'%Y-%m-%d') BRDDATE" +
                   " FROM TBL_BOARD" +
                  " WHERE BRDNO=" + req.query.brdno;
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);

            res.render('board1/form', {row: rows[0]});
            connection.release();
        });
    });
});

router.post('/save', function(req,res,next){


    pool.getConnection(function (err, connection) {
        var sql = "";

        if(req.user) {
          var data = [req.user.id, req.body.brdtitle, req.body.brdno];
          var data2 = [req.body.brdtitle, req.body.brdmemo ,req.user.id];
          if (req.body.brdno) {
              sql = "update tbl_board a inner join tbl_users b on a.brdwriter = ? set a.brdtitle = ? where a.brdno = ?";
              connection.query(sql, data, function (err, rows) {

                  if (err) console.error("err : " + err);

                  res.redirect('/board1/list');
                  connection.release();
              });
          } else {
              sql = "INSERT INTO TBL_BOARD(BRDTITLE, BRDMEMO, BRDWRITER) VALUES(?,?,?)";
              connection.query(sql, data2, function (err1, rows) {

                  if (err1) console.error("err1 : " + err);

                  res.redirect('/board1/list');
                  connection.release();
              });
          }
        }else {
          res.send("로그인을 해주세요 !.")
        }
    });
});

/*
router.get('/delete', function(req,res,next){
    pool.getConnection(function (err, connection) {
        var sql = "DELETE FROM TBL_BOARD" +
                  " WHERE BRDNO=" + req.query.brdno;
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);

            res.redirect('/board1/list');
            connection.release();
        });
    });
});*/


router.get('/delete', function(req,res,next){
    pool.getConnection(function (err, connection) {
        if(req.user) {
            var data = [req.user.id, req.query.brdno];
            var sql = "delete tbl_board from tbl_users join tbl_board on tbl_board.brdwriter = ? and tbl_board.brdno = ?" ;
            connection.query(sql,data, function (err, rows) {
                if (err) console.error("err : " + err);

                res.redirect('/board1/list');
                connection.release();
            });
        }else {
          res.send("로그인을 해주세요!.");
        }
    });
});

module.exports = router;
