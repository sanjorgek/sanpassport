const passport = require('passport'),
  debug = require('debug')('sanpassport'),
  map = require('async/map'),
  asyncify = require('async/asyncify'),
  local = require('./strategies/local');
  google = require('./strategies/google.js');

const auth = (req, res, next) => {
  return (req.isAuthenticated())?
    next():
    (() => {
      res.status(401);
      next(401);
    })();
}

const serialDefault = (user,done) => {
  done(null, user);
}

const logout = (req, res, next) => {
  if(req.user){
    req.logout();
  }
  next();
}

module.exports = (strategiesOps, ensureAuthenticated = auth, serailFunc = serialDefault, deserailFunc = serialDefault) => {
  passport.serializeUser(serailFunc);

  passport.deserializeUser(deserailFunc);

  let sanpassport = {
    initialize: passport.initialize(),

    session: passport.session(),

    logout,

    authenticate: ensureAuthenticated
  };

  let selectStrategies = (opts) => {
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
