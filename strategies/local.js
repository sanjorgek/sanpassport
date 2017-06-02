const LocalStrategy = require('passport-local').Strategy,
  cbLogin = require('../lib/common').login,
  debug = require('debug')('sanpassport:local');

const MIN_PASSWORD_SCORE = 2;

const localStrategy = (opts, func) => {
  return (opts &&  (typeof opts === 'object'))?
    new LocalStrategy(opts, func):
    new LocalStrategy(func);
};

module.exports = (passport, strategy = {}) => {
  passport.use(
    localStrategy(strategy.options, strategy.func)
  );

  return {
    login (req, res, next) {
      passport.authenticate('local', cbLogin(req, res, next))(req, res, next);
    },
    logout (req, res, next) {
      if(req.user){
        req.logout();
      }
      return next();
    },
    authenticate (req, res, next) {
      return (req.isAuthenticated())?
        next():
        next(401);
    }
  };
};
