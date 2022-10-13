var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');


var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session config
app.use(session({
  secret: 'secretsecret123',
  resave: true,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 1000 * 60 * 60 * 24 }
}))

/*
  AUTH KORISNIKA
  1. ako korisnik nema validnu sesiju redirektamo ga na login stranicu
  2. ako vec ide na login/register rutu onda ga pustimo dalje
  3. ako ima validnu sesiju a zeli na login/register redirektamo ga na default homepage rutu
  4. u svakom drugom slucaju pustiti korisnika na narednu rutu
*/

app.use(async function (req, res, next) {

  let isUserAuth = false;

  if (req.session.user) {
    isUserAuth = true;
  }

  // 1 i 2
  if (!isUserAuth) {
    if (req.originalUrl === '/auth/signup' || req.originalUrl === '/auth/login' || req.originalUrl === '/') {
      return next();
    }
    return res.redirect('/');
  }

  // 3
  if (req.originalUrl === '/auth/signup' || req.originalUrl === '/auth/login' || req.originalUrl === '/')
    return res.redirect('/homepage');

  // 4
  return next();
});



app.use('/', indexRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
