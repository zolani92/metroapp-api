var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

async function connectToMongoose() {
    await mongoose.connect(process.env.MONGOLAB_URI, {'useMongoClient': true});
}
connectToMongoose()

module.exports = { mongoose };
