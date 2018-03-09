var model = require('../domain/model');
var strava = require('../services/strava');
const endomondo = require('../services/endomondo');
var jwt = require('jwt-simple');

exports.config = function (app, SECRET) {

    app.post(`/api/users/token`, (req, res, next) => {
        if (req.query.type === 'strava') {
            strava.getAthlete(req.body.access_token).then(athlete => {
                return model.User.create({
                    name: athlete.firstname,
                    lastName: athlete.lastname,
                    sex: athlete.sex === 'M' ? 'Male' : 'Female',
                    pictureUrl: athlete.profile,
                    email: athlete.email,
                    city: athlete.city,
                    state: athlete.state,
                    country: athlete.country,
                    preferences: {
                        dateFormat: athlete.date_preference,
                        measurement: athlete.measurement_preference
                    },
                    strava: {
                        id: athlete.id,
                        access_token: req.body.access_token
                    }
                })
                .then(user => {
                    let token = createJWT(user);
                    token.user = user;
                    res.send(token);
                });
            }).catch(err => res.status(500).send());
        } else if (req.query.type === 'endomondo') {
            endomondo.getAccount(req.body.authToken).then(account => {
                return model.User.create({
                    name: account.first_name,
                    lastName: account.last_name,
                    sex: account.sex === 'MALE' ? 'Male' : 'Female',
                    pictureUrl: account.picture_url,
                    email: account.email,
                    country: account.country,
                    preferences: {
                        measurement: account.units
                    },
                    endomondo: {
                        id: account.id,
                        authToken: req.body.authToken
                    }
                })
                .then(user => {
                    let token = createJWT(user);
                    token.user = user;
                    res.send(token);
                });
            }).catch(err => res.status(500).send());
        } else {
            res.status(409).send('Invalid type');
        }
    });

    app.get('/api/users/token', (req, res, next) => {
        if (req.query.type === 'strava') {
            strava.getAthlete(req.query.access_token).then(athlete => {
                return model.User.findOne({'strava.id': athlete.id}).then(user => {
                    if (user) {
                        let token = createJWT(user);
                        token.user = user;
                        res.send(token);
                    } else {
                        res.status(404).send('user not found');
                    }
                }).catch(err => res.status(409).send(JSON.stringify(err)))
            }).catch(err => res.status(404).send(err));
        } else if (req.query.type === 'endomondo') {
            endomondo.getAccount(req.query.authToken).then(account => {
                console.log('account', account)
                return model.User.findOne({'endomondo.id': account.id}).then(user => {
                    if (user) {
                        let token = createJWT(user);
                        token.user = user;
                        res.send(token);
                    } else {
                        res.status(404).send('user not found');
                    }
                }).catch(err => res.status(409).send(JSON.stringify(err)))
            }).catch(err => res.status(404).send(err));
        } else {
            res.status(409).send('Invalid type');
        }
    });

    app.get(`/api/users/me`, (req, res, next) => {
        model.User.findById(req.user.sub)
            .then(me => {
                if (me) {
                    res.send(me);
                } else {
                    res.status(404).send();
                }
            })
            .catch(err => next(err));
    });

    const createJWT = function(user) {
        // 6 months duration
        var exp = new Date().getTime()+(1000*60*60*24*30*7);
        let permissions = [];
        return {
            token: jwt.encode({
                iss: 'https://soccerjoin.herokuapp.com/',
                sub: user._id,
                name: user.name,
                lastName: user.lastName,
                permissions: permissions,
                exp: exp
            }, SECRET),
            exp
        };
    }
};
