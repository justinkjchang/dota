var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

/* START db configs ----------------------------------------------------- */

// database
var mongoose = require('mongoose');
var configDB = require('./config/dbconfig.js');

// connect to mongodb
mongoose.connect(configDB.url);



/* END db configs ------------------------------------------------------- */

var routes = require('./routes');
var users = require('./routes/user');
var signup = require('./routes/signup');
var login = require('./routes/login');


/* START express configs ------------------------------------------------ */

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

/* END express configs -------------------------------------------------- */

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
console.log('Environment: ' + app.get('env'));
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });

    // moved here so only logger if in dev environment
    app.use(logger('dev'));
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// display index
app.get('/', routes.index);
app.get('/users', users.list);
app.get('/signup', signup.signup);
app.get('/login', login.login);

// copied from ./bin/www to allow nodemon usage
var debug = require('debug')('my-application');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});


// get form info

var msg,user,pass,repeatPass;
app.post('/signup', function(req, res){

    user = req.body.user;
    pass = req.body.password;
    repeatPass = req.body.repeatPassword;

    if(pass == repeatPass && user && pass && repeatPass){
        msg = "Passwords match";
    } else if (!user || !pass || !repeatPass){
        msg = "A field is empty";
    } else if (pass != repeatPass){
        msg = "Error: passwords do not match";
    }
    res.send(req.body);
    console.log(msg);
    
});

app.get('/signup', function(req, res){
    console.log(req.body);
});

app.post('/login', function(req, res){
    res.send(req.body);
});


module.exports = app;
