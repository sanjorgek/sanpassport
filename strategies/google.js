const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  cbLogin = require('../lib/common').login,
  debug = require('debug')('sanpassport:google');

const strategyWrapper = (strategyFunction) => (accessToken, refreshToken, profile, done) => {
  strategyFunction(accessToken, refreshToken, profile, function(err, profile){
    return (err)? 
      done(err):
      (() => {
        profile.strategy = 'google';
        done(err, profile);
      })();
  });
}

const optStrategyFunc = (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}

module.exports = (passport, strategyFunc, config) => {
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

  return {
    login: passport.authenticate('google', {failureRedirect: config.failureRedirect, scope: config.scope}, cbLogin(req, res, next)),
    callback: passport.authenticate('google', { failureRedirect: config.failureRedirect })
  };
};
