var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();





app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded( { extended : true}));
app.use(bodyParser.json());
app.use(session({ secret : 'enter secret key',
                  resave : false,
                  saveUninitialized : true
}));

//passport 사용
app.use(passport.initialize());
app.use(passport.session());


app.use(function(req,res,next){
 res.locals.isAuthenticated = req.isAuthenticated();
 res.locals.currentUser = req.user;
 next();
})

//라우터
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/board1', require('./routes/board1'));

app.use(function(req, res, next) {
  next(createError(404));
});

//에러처리
app.use(function(err, req, res, next) {
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 에러페이지 연결
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
