var express = require('express');
var router = express.Router();

// GET / 
// Home Route
router.get('/', function(req, res, next){
	res.render('home', {title:'Home'});
});
// POST /
// Search for bars in the specified city
router.post('/', function(req, res, next){
	// Request bars to Yelp API
	res.redirect('/search');
});
// GET /search
// Display Search
router.get('/search', function(req, res, next){
	res.send('Hello from /serach');
});

module.exports = router;