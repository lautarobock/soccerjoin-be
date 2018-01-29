var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.User = mongoose.model('User', new mongoose.Schema({
    name: String,
    lastName: String,
    sex: String,
    pictureUrl: String,
    email: String,
    city: String,
    state: String,
    country: String,
    preferences: {
        dateFormat: String,
        measurement: String
    },
    strava: {
        id: Number,
        access_token: String
    }
}));