var passport = require('passport'),
  debug = require('debug')('sanpassport'),
  map = require('async/map'),
  asyncify = require('async/asyncify'),
  local = require('./strategies/local');

module.exports = function(strategiesOps) {
  passport.serializeUser(function(user, done) {
    if(!user) done(new Error("bad user"));
    else done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
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
  }

  map(
    strategiesOps,
    asyncify(selectStrategies),
    debug
  );

  return sanpassport;
};
