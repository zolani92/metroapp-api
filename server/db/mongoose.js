var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI, {'useMongoClient': true});
mongoose.Promise = global.Promise;

module.exports = { mongoose };
