var strava = require('strava-v3');

exports.getAthlete = function (access_token) {
    return new Promise((resolve, reject) => {
        strava.athlete.get({ access_token }, (err, athlete) => {
            if (err) {
                reject(err);
            } else {
                resolve(athlete)
            }
        });
    });
}