var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.User = mongoose.model('User', new Schema({
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

exports.Match = mongoose.model('Match', new Schema({
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    likes: [{
        date: Date,
        name: String,
        pictureUrl: String,
        owner: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    strava: {
        id: Number,
        external_id: String
    },
    distance: Number,
    movingTime: Number,
    elapsedTime: Number,
    startDate: Date,
    averageSpeed: Number,
    maxSpeed: Number,
    averageHeartRate: Number,
    maxHeartRate: Number,
    calories: Number,
    creationDate: Date,
    modificationDate: Date,
    center: {lat: Number, lng: Number},
    streams: {
        time: [Number],
        distance: [Number],
        heartRate: [Number],
        latlng: [{lat: Number, lng: Number}]
    },
    join: { type: Schema.Types.ObjectId, ref: 'Join' },
    isPublic: {type: Boolean, default: false},
    comments: [{
        text: String,
        owner: { type: Schema.Types.ObjectId, ref: 'User' },
        creationDate: Date,
        modificationDate: Date
    }]
}));

exports.Join = mongoose.model('Join', new Schema({
    matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }]
}));