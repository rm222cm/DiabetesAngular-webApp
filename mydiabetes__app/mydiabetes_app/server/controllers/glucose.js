const Glucose = require('../database/models/glucose');

exports.create = (req, res) => {

  req.body.email = req.session.user.email
  Glucose.create(req.body)
    .then((newGlucose) => {
      res.json({
        msg: 'success',
        redirect: '/home',
        data: newGlucose
      });
    })
    .catch((dbErr) => {
      res.json({
        msg: 'fail'
      });
    });
};

exports.getall = (req, res) => {

    Glucose.find({})
    .then((newGlucose) => {
      res.json({
        msg: 'success',
        redirect: '/home',
        data: newGlucose
      });
    })
    .catch((dbErr) => {
      res.json({
        msg: 'fail'
      });
    });
};

// (yyyy, mm, dd)
exports.get = (req, res) => {
  
  Glucose.find( { $and: [ { "entryTime": { "$gte": req.body.startDate, "$lt": req.body.endDate } }, { "email": req.session.user.email } ] } )
    .then((newGlucose) => {
      res.json({
        msg: 'success',
        redirect: '/home',
        data: newGlucose
      });
    })
    .catch((dbErr) => {
      res.json({
        msg: 'fail'
      });
    });
};


exports.getLatestGlucoseLevel = (req, res) => {

    Glucose.find({"email": req.session.user.email}).sort({"glucoseTime": -1}).limit(1)
      .then((newGlucose) => {
        res.json({
          msg: 'success',
          redirect: '/home',
          data: newGlucose[0].glucoseLevelUnits
        });
      })
      .catch((dbErr) => {
        res.json({
          msg: 'fail'
        });
      });
  };

  exports.getLatestGlucoseLevelByTime = (req, res) => {
      Glucose.find( { $and: [ { "glucoseTime": { "$lte": req.body.compareTime } }, { "email": req.session.user.email } ] }).sort({"glucoseTime": -1}).limit(1)
        .then((newGlucose) => {
          res.json({
            msg: 'success',
            redirect: '/home',
            data: newGlucose[0].glucoseLevelUnits
          });
        })
        .catch((dbErr) => {
          res.json({
            msg: 'fail'
          });
        });
    };