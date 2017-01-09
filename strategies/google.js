var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  debug = require('debug')('sanpassport:google');

function optStrategyFunc (accessToken, refreshToken, profile, done) {
    done(null, profile);
}

function optEnsureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(401);
  next(401);
}

module.exports = function (passport, strategyFunc, ensureAuthenticated, config) {
  if(!ensureAuthenticated ||(typeof ensureAuthenticated != 'function')){
    ensureAuthenticated = optEnsureAuthenticated;
  }
  let strategy = optStrategyFunc;
  if (strategyFunc &&  (typeof strategyFunc === 'function')) {
    strategy = strategyFunc;
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
        callbackURL: config.callbackURL,
      },
      strategy
  ));

  function login(req, res, next) {
    passport.authenticate('google', {failureRedirect: config.failureRedirect, scope: config.scope}, function(err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        req.session.messages =  [info.message];
        res.status(403);
        next(403);
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return next();
      });
    })(req, res, next);
  }

  return {
    authenticate: ensureAuthenticated,
    login: login,
    callback: passport.authenticate('google', { failureRedirect: config.failureRedirect })
  };
};
