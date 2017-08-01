var express = require('express');
var router = express.Router();
var yelp = require('yelp-fusion');
var User = require('../models/user');
var mid = require('../middleware');

// Yelp Keys
var clientId = 'DB3MWYqRCvWCKg5E-hs-SA';
var clientSecret = 'L0fDXzoPl2NZQRnb6BwMtIhEU5GSuSGRC1I6ly1L1U1WhqrXgkgQZZg9dnCLYCMb';

var results;

router.param('pID', function (req, res, next, id) {
	if(req.session && req.session.username) {
		User.findOne({ username: req.session.username })
				.exec(function (error, user){
					if(error){
						return next(error);
					} else if (!user) {
						error = new Error('Not Found');
						error.status = 404;
						return next(DOMError);
					} else {
						if (user.places_id.indexOf(id) === -1){
							user.places_id.push(id);
							user.save(function(err, user) {
								if(err) return next(err);
								return next();
							});
						} else {
							// Delete id
							user.places_id.splice(user.places_id.indexOf(id),1);
							user.save(function(err, question) {
								if(err) return next(err);
								return next();
							});
						}
					}
				});
	} else {
		return res.redirect('/login');
	}
});

// GET / 
// Home Route
router.get('/', function(req, res, next){
	res.render('home', {title:'Home', search_error: req.cookies.search_error || null});
});

router.get('/search', mid.getUserPlaces, function(req, res, next){
	if(!req.cookies.city || !results) {
		return res.redirect('/');
	}
	res.render('search', {places: results, userPlaces: req.userPlaces, page:req.cookies.city.page, max_pages:req.cookies.city.max_pages, title: 'Search'});
});

// POST /search
// Display Search
router.post('/search', mid.getUserPlaces,function(req, res, next){
	// Request bars to Yelp API
	if(req.cookies.search_error) res.clearCookie('search_error');
	var searchRequest = {
		term: 'Bars',
		location: '',
		categories: 'nightlife',
		offset: 0,
	};
	if(req.body.city && req.body.country){
		searchRequest.location = req.body.city.toLowerCase() + ', ' + req.body.country.toLowerCase();
	} else {
		searchRequest.location = req.cookies.city.city + ', ' + req.cookies.city.country;
	}
	var page = parseInt(req.query.offset) - 1;
	searchRequest.offset = page * 20;
	yelp.accessToken(clientId, clientSecret).then(response => {
  var client = yelp.client(response.jsonBody.access_token);
		client.search(searchRequest).then(response => {
			results = response.jsonBody.businesses;
			var max_pages = 5;
			if(response.jsonBody.total/1 <= 20) {
				max_pages = 1;
			} else if(response.jsonBody.total/2 <= 40) {
				max_pages = 2;
			} else if(response.jsonBody.total/3 <= 60) {
				max_pages = 3;
			} else if(response.jsonBody.total/4 <= 80) {
				max_pages = 4;
			}
			res.cookie( 'city', {city:req.body.city, country:req.body.country, page:page+1, max_pages:max_pages} );
			res.render('search', {places: results, userPlaces: req.userPlaces, page: page + 1, max_pages: max_pages, title: 'Search'});
		}).catch(e => {
			res.cookie( 'search_error', searchRequest.location );
			res.redirect('/');
		});
	}).catch(e => {
		next(e);
	});
});

// POST /search/:pId
// Search for bars in the specified city
router.post('/search/:pID',function(req, res, next){
	return res.redirect('/search');
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