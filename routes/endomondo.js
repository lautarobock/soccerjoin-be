const endomondo = require('../services/endomondo');

exports.config = function (app) {

    app.get('/api/endomondo/auth', (req, res, next) => {
        let url = req.url.split('?')[1];
        console.log('URL', url);
        endomondo.auth(url)
            .then(data => res.send(data))
            .catch(err => next(err));
    });

    app.get('/api/endomondo/workout', (req, res, next) => {
        endomondo.workoutList(req.query.authToken)
            .then(data => res.send(data))
            .catch(err => next(err));
    });

    app.get('/api/endomondo/workout/:id', (req, res, next) => {
        endomondo.workoutDetail(req.query.authToken, req.params.id)
            .then(data => res.send(data))
            .catch(err => next(err));
    });

}