var passport = require('passport'),
  debug = require('debug')('sanpassport'),
  map = require('async/map'),
  asyncify = require('async/asyncify'),
  local = require('./strategies/local');
  google = require('./strategies/google.js');

module.exports = function(strategiesOps) {
  passport.serializeUser(function(user, done) {
    if (user.strategy === 'google'){
      return done(null, user);
    }
    if(!user) done(new Error("bad user"));
    else done(null, user);

  });

  passport.deserializeUser(function(obj, done) {
    if (obj.strategy === 'google'){
      return done(null, obj);
    }
    userModel.find(obj, function (err, user) {
      done(err, user);
    });

  });

  function logout (req, res, next) {
    if(req.user){
      req.logout();
    }
    next();
  }

  var sanpassport = {
    initialize: passport.initialize(),

    session: passport.session(),

    logout: logout
  };

  function selectStrategies (opts) {
    if(opts.name==='local') sanpassport.local = local(passport, opts.model, opts.strategyFunc, opts.authenticate);
    if(opts.name==='google')sanpassport.google = google(passport, opts.strategyFunc, opts.authenticate, opts.config);
  }

  map(
    strategiesOps,
    asyncify(selectStrategies),
    debug
  );

  return sanpassport;
};
