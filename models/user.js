var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		trim: true,
		unique: true,
	},
	img_url: {
		type: String,
		required: false,
		trim: true,
	},
	places_id: {
		type: Array,
		required: false,
		default: [],
	},
});

var User = mongoose.model('User', UserSchema);
module.exports = User;


