var mongoose = require('mongoose');

const SECRET = '04c5fcdc-5c83-4b77-8891-8b3cbce25f1c';

exports.configure = function (app) {
    mongoose.connect(process.env.MONGOLAB_URI);
    secure(app);
    require('./routes/users').config(app, SECRET);
    require('./routes/matches').config(app);
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
            '/api/test',
            /\/public\/.*/,
        ]
    }));
}