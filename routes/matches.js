var model = require('../domain/model');

exports.config = function (app) {

    app.get('/api/matches', (req, res, next) => {
        let filter = {name: new RegExp(`.*${req.query.q || ''}.*`,'gi')};
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
            .populate('join')
            .populate('owner')
            .then(match => res.send(match))
            .catch(err => next(err));
    });

    app.get('/public/matches/:id', (req, res, next) => {
        model.Match.findById(req.params.id)
            .populate('join')
            .populate('owner')
            .then(match => res.send(match))
            .catch(err => next(err));
    });

    app.put('/api/matches/:id', (req, res, next) => {
        req.body.modificationDate = new Date();
        model.Match.findOneAndUpdate({_id: req.params.id, owner: req.user.sub}, {$set: req.body}, {new: true}).then(match => {
            if (!match) {
                res.status(403).send('You dont have permission');
            } else {
                res.send(match);
            }
        }).catch(err => next(err));
    });

    app.delete('/api/matches/:id', (req, res, next) => {
        model.Match.findOneAndRemove({_id: req.params.id, owner: req.user.sub}, {$set: req.body}).then(match => {
            if (!match) {
                res.status(403).send('You dont have permission');
            } else {
                res.send(match);
            }
        }).catch(err => next(err));
    });

    app.post('/api/matches', (req, res, next) => {
        req.body.owner = req.user.sub;
        req.body.creationDate = new Date();
        req.body.modificationDate = new Date();
        model.Match.create(req.body).then(match => res.send(match)).catch(e => next(e));
    });

    //**** Like *****

    app.post('/api/matches/:id/like', (req, res, next) => {
        model.User.findById(req.user.sub).then(user => {
            return model.Match.findByIdAndUpdate(req.params.id, {
                $push: {
                    likes: {
                        date: new Date(),
                        name: `${user.name} ${user.lastName}`,
                        pictureUrl: user.pictureUrl,
                        owner: user
                    }
                }
            }).then(() => res.status(201).send());
        })
            .catch(err => next(err));
    });

    app.delete('/api/matches/:id/like', (req, res, next) => {
        return model.Match.findByIdAndUpdate(req.params.id, {
            $pull: {
                likes: { owner: req.user.sub }
            }
        })
            .then(() => res.status(204).send())
            .catch(err => next(err));
    });

    //**** Join *****

    app.post('/api/matches/:id/join/:with', (req, res, next) => {
        Promise.all([
            model.Match.findById(req.params.id).populate('join'),
            model.Match.findById(req.params.with).populate('join')
        ]).then(matches => {
            const [m1, m2] = matches;
            if (m1.join && !m2.join) {
                // m1 <= m2
                m2.join = m1.join;
                return Promise.all([
                    model.Join.findByIdAndUpdate(m1.join._id, { $push: { matches: m2 } }, { new: true }),
                    m2.save()
                ]).then(responses => res.send(responses[0]));
            } else if (!m1.join && m2.join) {
                // m2 <= m1
                m1.join = m2.join;
                return Promise.all([
                    model.Join.findByIdAndUpdate(m2.join._id, { $push: { matches: m1 } }, { new: true }),
                    m1.save()
                ]).then(responses => res.send(responses[0]));
            } else if (m1.join && m2.join && m1.join._id.toString() !== m2.join._id.toString()) {
                // merge joins (remove join of m2 and join to the m2)
                return model.Join.findByIdAndRemove(m2.join._id).populate('matches').then(removedJoin => {
                    removedJoin.matches.forEach(match => match.join = m1.join);
                    const promises = removedJoin.matches.map(match => match.save());
                    promises.push(model.Join.findByIdAndUpdate(m1.join._id, { $push: { matches: { $each: removedJoin.matches } } }, { new: true }));
                    return Promise.all(promises).then(responses => res.send(responses[responses.length - 1]));
                });
            } else if (!m1.join && !m2.join) {
                // m1 <= m2 (new join)
                return model.Join.create({ matches: [m1._id, m2._id] }).then(join => {
                    m1.join = join;
                    m2.join = join;
                    return Promise.all([m1.save(), m2.save()]).then(() => res.send(join));
                });
            } else {
                res.status(409).send('Already in the same Join');
            }
        })
            .catch(err => next(err));
    });
}