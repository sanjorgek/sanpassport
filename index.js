var passport = require('passport'),
  debug = require('debug')('sanpassport'),
  map = require('async/map'),
  asyncify = require('async/asyncify'),
  local = require('./strategies/local');
  google = require('./strategies/google.js');

function auth (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(401);
  next(401);
}

module.exports = function(strategiesOps, ensureAuthenticated = auth) {
  passport.serializeUser(function(user, done) {
    if (user.strategy === 'google'){
      return done(null, user);
    }
    done(null, user);

  });

  passport.deserializeUser(function(obj, done) {
    if (obj.strategy === 'google'){
      return done(null, obj);
    }
    done(null, obj);

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

    logout: logout,

    authenticate: ensureAuthenticated
  };

  function selectStrategies (opts) {
    if(opts.name==='local') sanpassport.local = local(passport, opts.model, opts.strategyFunc);
    if(opts.name==='google')sanpassport.google = google(passport, opts.strategyFunc,opts.config);
  }

  map(
    strategiesOps,
    asyncify(selectStrategies),
    debug
  );

  return sanpassport;
};
