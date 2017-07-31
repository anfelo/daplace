var User = require('../models/user');

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