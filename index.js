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

function serialDefault (user,done) {
  done(null, user);
}

module.exports = function(strategiesOps, ensureAuthenticated = auth, serailFunc = serialDefault, deserailFunc = serialDefault) {
  passport.serializeUser(serailFunc);

  passport.deserializeUser(deserailFunc);

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
