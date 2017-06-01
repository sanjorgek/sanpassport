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
};

const optStrategyFunc = (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
};

module.exports = (passport, strategy={options:
  {
    clientID: "your_client_id",
    clientSecret: "SHHHH! It's a secret",
    failureRedirect : "/"
  }}
) => {
  let strategyFunc = (strategy.func &&  (typeof strategy.func === 'function'))?
    strategy.func:
    optStrategyFunc;
  let config = strategy.options;
  if (!config.failureRedirect) {
    config.failureRedirect = '/';
  }
  if (!config.scope){
    config.scope = ['email'];
  }

  passport.use(
    new GoogleStrategy(config,
      strategyWrapper(strategyFunc)
  ));

  return {
    login (req, res, next) {
      return passport.authenticate(
        'google',
        {failureRedirect: config.failureRedirect, scope: config.scope},
        cbLogin(req, res, next)
      )(req, res, next);
    },
    callback: passport.authenticate('google', { failureRedirect: config.failureRedirect })
  };
};
