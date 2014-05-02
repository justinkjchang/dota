var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');

/* START db configs ----------------------------------------------------- */

// database
var mongoose = require('mongoose');
var configDB = require('./config/dbconfig.js');
var schema = require('./models/user.js');

// connect to mongodb
mongoose.connect(configDB.url);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback(){
    console.log("Successfully connected to mongodb on " + configDB.url);
});

var userSchema = new mongoose.Schema({
        username: String,
        email: String,
        firstname: String,
        lastname: String,
        password: String

 });

var userModel = mongoose.model('account', userSchema);

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
app.use(flash());

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
var userExists = false;

app.post('/signup', function(req, res){

    username = req.body.username;
    password = req.body.password;
    repeatPass = req.body.repeatPassword;    

    userExists = false;

    // check if username already exists in database
    userModel.findOne({'username':username.toLowerCase()}, function(err, user){
        try {
            if (user || user.toLowerCase() == username.toLowerCase()){
                userExists = true;
            } else {
                userExists = false;
            }
        } catch (err){

        }
        
        if(err) return handleError(err);

        // ensure signup form is properly filled out
        if (!username || !password || !repeatPass){
            msg = "A field is empty";
            // reload page with error message
            res.render("signup", {info: msg});
            console.log(msg);

        } else if (password != repeatPass){
            msg = "Error: passwords do not match";
            // reload page with error message
            res.render("signup", {info: msg});
            console.log(msg);

        } else if(userExists){
            msg = "Username exists";
            res.render("signup", {info: msg});
            console.log(msg);

        } else if((password == repeatPass) && username && password && repeatPass && !userExists){
            
            // create new user as an object using user model
            // save username as lower case
            user = new userModel({username: username, password: password});
            // save new user object into database
            user.save(function(err){
                if(err){
                    console.log(err);
                }
                msg = username + " Account saved";
                console.log(msg);
            });
            
        }
        
        res.send(req.body);
        
    });
    
    //console.log("username: " + user1.username + "\nemail: " + user1.email + "\n_id: " + user1._id);
    
});

app.post('/login', function(req, res){

    username = req.body.username;
    password = req.body.password;
    userExists = false;

       // check if username already exists in database
    userModel.findOne({'username':username.toLowerCase()}, function(err, user){
        try {
            if (user || user.toLowerCase() == username.toLowerCase()){
                userExists = true;
            } else {
                userExists = false;
            }
        } catch (err){

        }
        
        if(err) return handleError(err);

        // ensure signup form is properly filled out
        if (!username || !password){
            msg = "A field is empty";
            // reload page with error message
            res.render("login", {info: msg});
            console.log(msg);
            res.send(req.body);

        } else if (!userExists){
            msg = "Username '" + username + "' doesn't exist";
            console.log(msg);
            res.render("login", {info: msg});

        } else if (username && password && userExists){
            if(password == user.password){
                res.send("Logged in");
            } else {
                msg = "Incorrect password";
                console.log(msg);
                res.render("login", {info: msg});
            }
            // login method here
        }

    });

});


module.exports = app;
