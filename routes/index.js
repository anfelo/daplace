var express = require('express');
var router = express.Router();
var yelp = require('yelp-fusion');
var User = require('../models/user');
var mid = require('../middleware');

// Yelp Keys
var clientId = 'DB3MWYqRCvWCKg5E-hs-SA';
var clientSecret = 'L0fDXzoPl2NZQRnb6BwMtIhEU5GSuSGRC1I6ly1L1U1WhqrXgkgQZZg9dnCLYCMb';

var searchRequest = {
  term: 'Bars',
  location: '',
  categories: 'nightlife'
};

var results;

router.param('pID', function (req, res, next, id) {
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
});

// GET / 
// Home Route
router.get('/', function(req, res, next){
	res.render('home', {title:'Home'});
});

router.get('/search', mid.getUserPlaces, function(req, res, next){
	if(!req.cookies.city || !results) {
		return res.redirect('/');
	}
	res.render('search', {places: results, userPlaces: req.userPlaces, title: 'Search'});
});

// POST /search
// Display Search
router.post('/search', mid.getUserPlaces,function(req, res, next){
	// Request bars to Yelp API
	searchRequest.location = req.body.city.toLowerCase();
	yelp.accessToken(clientId, clientSecret).then(response => {
  var client = yelp.client(response.jsonBody.access_token);

		client.search(searchRequest).then(response => {
			res.cookie( 'city', req.body.city );
			results = response.jsonBody.businesses;
			res.render('search', {places: results, userPlaces: req.userPlaces, title: 'Search'});
		}).catch(e => {
				next(e);
		});
	}).catch(e => {
		next(e);
	});
});

// POST /search/:pId
// Search for bars in the specified city
router.post('/search/:pID',function(req, res, next){
	if(req.session && req.session.username) {
		return res.redirect('/search');
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