var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  cbLogin = require('../lib/common').login,
  debug = require('debug')('sanpassport:google');

function strategyWrapper(strategyFunction){
  return function(accessToken, refreshToken, profile, done){
    strategyFunction(accessToken, refreshToken, profile, function(err, profile){
      if (err){
        return done(err);
      }
      profile.strategy = 'google';
      done(err, profile);
    });
  };
}

function optStrategyFunc (accessToken, refreshToken, profile, done) {
  done(null, profile);
}

module.exports = function (passport, strategyFunc, config) {
  let strategy = strategyWrapper(optStrategyFunc);
  if (strategyFunc &&  (typeof strategyFunc === 'function')) {
    strategy = strategyWrapper(strategyFunc);
  }
  if (!config.failureRedirect) {
    config.failureRedirect = '/';
  }
  if (!config.scope){
    config.scope = ['email'];
  }

  passport.use(
    new GoogleStrategy({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackURL
      },
      strategy
  ));

  function login(req, res, next) {
    passport.authenticate('google', {failureRedirect: config.failureRedirect, scope: config.scope}, cbLogin(req, res, next))(req, res, next);
  }

  return {
    login: login,
    callback: passport.authenticate('google', { failureRedirect: config.failureRedirect })
  };
};
