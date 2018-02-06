var model = require('../domain/model');

exports.config = function(app) {

    app.get('/api/matches', (req, res, next) => {
        let filter = {};
        if (req.query.owner !== undefined && req.query.owner !== null && req.query.owner !== '') {
            filter.owner = req.query.owner;
        }
        model.Match.find(filter, '-streams')
            .populate('owner')
            .sort('-startDate')
            .then(matches => res.send(matches))
            .catch(e => next(e))
    });

    app.get('/api/matches/:id', (req, res, next) => {
        model.Match.findById(req.params.id)
            .populate('owner')
            .then(match => res.send(match))
            .catch(err => next(err));
    })

    app.post('/api/matches', (req, res, next) => {
        req.body.owner = req.user.sub;
        req.body.creationDate = new Date();
        req.body.modificationDate = new Date();
        model.Match.create(req.body).then(match => res.send(match)).catch(e => next(e));
    });

    app.post('/api/matches/:id/like', (req, res, next) => {
        model.User.findById(req.user.sub).then(user => {
            return model.Match.findByIdAndUpdate(req.params.id, {$push: {
                likes: {
                    date: new Date(),
                    name: `${user.name} ${user.lastName}`,
                    pictureUrl: user.pictureUrl,
                    owner: user
                }
            }}).then(() => res.status(201).send());
        })
        .catch(err => next(err));
    });

    app.delete('/api/matches/:id/like', (req, res, next) => {
        return model.Match.findByIdAndUpdate(req.params.id, {$pull: {
            likes: {owner: req.user.sub}
        }})
        .then(() => res.status(204).send())
        .catch(err => next(err));
    });
}