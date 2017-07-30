var express = require('express');
var router = express.Router();
var yelp = require('yelp-fusion');

var clientId = 'DB3MWYqRCvWCKg5E-hs-SA';
var clientSecret = 'L0fDXzoPl2NZQRnb6BwMtIhEU5GSuSGRC1I6ly1L1U1WhqrXgkgQZZg9dnCLYCMb';

var searchRequest = {
  term: 'Bars',
  location: '',
  categories: 'nightlife'
};

// GET / 
// Home Route
router.get('/', function(req, res, next){
	res.render('home', {title:'Home'});
});
// POST /
// Search for bars in the specified city
router.post('/', function(req, res, next){
	
});
// GET /search
// Display Search
router.post('/search', function(req, res, next){
	// Request bars to Yelp API
	searchRequest.location = req.body.city.toLowerCase();
	yelp.accessToken(clientId, clientSecret).then(response => {
  var client = yelp.client(response.jsonBody.access_token);

		client.search(searchRequest).then(response => {
			var results = response.jsonBody.businesses;
			res.json(results);
		}).catch(e => {
				next(e);
		});
	}).catch(e => {
		next(e);
	});
});

module.exports = router;