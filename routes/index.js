var express = require('express');
var router = express.Router();
var yelp = require('yelp-fusion');
var User = require('../models/user');

// Yelp Keys
var clientId = 'DB3MWYqRCvWCKg5E-hs-SA';
var clientSecret = 'L0fDXzoPl2NZQRnb6BwMtIhEU5GSuSGRC1I6ly1L1U1WhqrXgkgQZZg9dnCLYCMb';

var searchRequest = {
  term: 'Bars',
  location: '',
  categories: 'nightlife'
};

var results;

// GET / 
// Home Route
router.get('/', function(req, res, next){
	res.render('home', {title:'Home'});
});

router.get('/search', function(req, res, next){
	if(!req.cookies.city || !results) {
		return res.redirect('/');
	}
	res.render('search', {places: results, title: 'Search'});
});

// POST /search
// Display Search
router.post('/search', function(req, res, next){
	// Request bars to Yelp API
	searchRequest.location = req.body.city.toLowerCase();
	yelp.accessToken(clientId, clientSecret).then(response => {
  var client = yelp.client(response.jsonBody.access_token);

		client.search(searchRequest).then(response => {
			res.cookie( 'city', req.body.city );
			results = response.jsonBody.businesses;
			res.render('search', {places: results, title: 'Search'});
		}).catch(e => {
				next(e);
		});
	}).catch(e => {
		next(e);
	});
});

// POST /search/:pId
// Search for bars in the specified city
router.post('/search/:pId',function(req, res, next){
	if(req.session && req.session.username) {
		res.send('You are logged, That place has been added to your preferences');
	}
	else {
		return res.redirect('/login');
	}
});

router.get('/login', function(req, res, next){
	return res.redirect('/session/connect');
});

router.get('/logout', function(req, res, next){
	if(req.session){
		//delete session
		results = '';
		res.clearCookie('city');
    req.session.destroy(function(err){
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;