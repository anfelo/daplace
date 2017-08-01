var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var app = express();

// mongodb connection
mongoose.Promise = global.Promise;
//mongodb://localhost:27017/daplace
var url = process.env.MONGOLAB_DAPLACE_URI;
mongoose.connect(url);
var db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, 'connection error'));

// use sessions for tracking logins
app.use(session({
  secret: 'treehouse loves you',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// make the session available in templates
app.use(function(req, res, next) {
	res.locals.username = req.session.username;
	res.locals.profile_img = req.session.profile_img;
  next();
});

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes');
var authRoute = require('./routes/auth');

app.use(routes);
app.use('/session', authRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Error Handler
app.use(function(err,req,res,next) {
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message
		}
	});
});

const port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log('Express server is listening on port', port);
});