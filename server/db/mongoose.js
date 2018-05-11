var mongoose = require('mongoose');

mongoose.connect('mongodb://ds119930.mlab.com:19930/heroku_w5s095mq', {'useMongoClient': true});
mongoose.Promise = global.Promise;

module.exports = { mongoose };
