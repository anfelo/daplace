var express = require('express');
var logger = require('express-logger');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var inspect = require('util-inspect');
var oauth = require('oauth');
var User = require('../models/user');

var router = express.Router();

// Get your credentials here: https://dev.twitter.com/apps
var _twitterConsumerKey = process.env.TWITTER_KEY;
var _twitterConsumerSecret = process.env.TWITTER_SECRET;

var consumer = new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
    _twitterConsumerKey, _twitterConsumerSecret, "1.0A", "https://anfelo-daplace.herokuapp.com/session/callback", "HMAC-SHA1");

router.get('/connect', function(req, res){
  consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
      res.send("Error getting OAuth request token : " + inspect(error), 500);
    } else {  
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
    }
  });
});

router.get('/callback', function(req, res){
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + inspect(error) + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + inspect(result) + "]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      
      res.redirect('/session');
    }
  });
});

router.get('/', function(req, res, next){
    consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
      if (error) {
        res.redirect('/session/connect');
      } else {
        var parsedData = JSON.parse(data);
        User.findOne({ username: parsedData.screen_name })
            .exec(function (error, user){
                if(error){
                  return next(error);
                } else if (!user) {
                  var userData = {
                    username: parsedData.screen_name,
                    img_url: parsedData.profile_image_url_https,
                  };
                  User.create(userData, function(error, user){
                    if(error){
                      return next(error);
                    } else {
                      req.session.username = parsedData.screen_name;
                      req.session.profile_img = parsedData.profile_image_url_https;
                      return res.redirect('/search');
                    }
                  });
                } else {
                  req.session.username = parsedData.screen_name;
                  req.session.profile_img = parsedData.profile_image_url_https;
                  return res.redirect('/search');
                }
            });
      } 
    });
});

module.exports = router;