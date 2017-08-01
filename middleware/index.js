var User = require('../models/user');
var yelp = require('yelp-fusion');

// Yelp Keys
var clientId = process.env.YELP_ID_DAPLACE;
var clientSecret = process.env.YELP_SECRET_DAPLACE;

function callYelp(req, res, next, search) {
	yelp.accessToken(clientId, clientSecret).then(response => {
  var client = yelp.client(response.jsonBody.access_token);
		client.search(search).then(response => {
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
			res.cookie( 'city', {city:req.body.city, country: req.body.country, page: req.page, max_pages: max_pages} );
			return res.render('search', {places: results, userPlaces: req.userPlaces, page: req.page, max_pages: max_pages, title: 'Search'});
		}).catch(e => {
			res.cookie( 'search_error', searchRequest.location );
			return res.redirect('/');
		});
	}).catch(e => {
		next(e);
	});
}

function getUserPlaces (req, res, next) {
	User.findOne({ username: req.session.username })
			.exec(function (error, user){
				if(error){
					return next(error);
				} else if (!user) {
					req.userPlaces = '';
					return next();
				} else {
					req.userPlaces = user.places_id;
					return next();
				}
			});
}

module.exports.getUserPlaces = getUserPlaces;
module.exports.callYelp = callYelp;