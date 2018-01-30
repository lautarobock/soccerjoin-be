var model = require('../domain/model');

exports.config = function(app) {

    app.get('/api/matches', (req, res, next) => {
        let filter = {};
        if (req.query.owner !== undefined && req.query.owner !== null && req.query.owner !== '') {
            filter.owner = req.query.owner;
        }
        model.Match.find(filter)
            .then(matches => res.send(matches))
            .catch(e => next(e))
    });
}