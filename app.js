var express = require('express');
var jsonParser = require('body-parser').json;
var app = express();

app.use(jsonParser());

// GET / 
// Home Route
app.get('/', function(req,res,next){
	res.send('Hello');
});

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