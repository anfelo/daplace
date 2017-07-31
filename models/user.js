var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
	},
	interests: [],
});
// authenticate input against database documents
UserSchema.statics.authenticate = function (username, callback){
    User.findOne({ username: username })
        .exec(function (error, user){
            if(error){
							return callback(error);
            } else if (!user) {
							// Create one
							var newUser = {};
							// Add it to the database
							// var err = new Error('User not found.');
							// err.status = 401;
							return callback(null, newUser);
            } else {
							return callback(null, user);
            }
        });
}

var User = mongoose.model('User', UserSchema);
module.exports = User;


