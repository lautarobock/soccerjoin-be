var mongoose = require('mongoose');

const MONGODB = 'mongodb://soccerjoin:soccer1234@ds111598.mlab.com:11598/soccerjoin';
const SECRET = '04c5fcdc-5c83-4b77-8891-8b3cbce25f1c';

exports.configure = function (app) {
    mongoose.connect(MONGODB);
    secure(app);
    require('./routes/users').config(app, SECRET);
    app.get('/api/test', (req, res, next) => {
        res.send({ text: 'Hola como va' });
    });
}

function secure(app) {
    app.use(require('express-jwt')({
        secret: SECRET,
        getToken: (req) => req.headers['x-access-token'] || req.query['x-access-token']
    }).unless({
        path: [
            '/',
            '/favicon.ico',
            '/robots.txt',
            '/api/users/token',
            '/api/test'
        ]
    }));
}