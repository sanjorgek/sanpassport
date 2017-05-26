const LocalStrategy = require('passport-local').Strategy,
  cbLogin = require('../lib/common').login,
  debug = require('debug')('sanpassport:local'),
  zxcvbn = require("zxcvbn");

const MIN_PASSWORD_SCORE = 2;

const optStrategyFunc = (userModel) => (username, password, done) => {
  return userModel.findOne({ username: username }, (err, user) => {
    return (err)? 
      (() => {
        debug(err);
        return done(err);
      })():
      (!user)? 
        done(null, false, { message: 'Unknown user ' + username }):
        user.comparePassword(password, (err, isMatch) => {
          return (err)?
            (() => {
              debug(err);
              return done(err);
            })():          
            (isMatch)?
              (() => {
                user.profile = "local";
                return done(null, user);
              })():
              (() => {
                debug("don't match");
                return done(null, false, { message: 'Invalid password' });
              })();
        });
  });
}

const ensureAdmin = (req, res, next) => {
  return (req.user && req.user.admin === true)? 
    next():
    (() => {
        res.status(401);
        return next(401);
    })();
}

module.exports = (passport, userModel, strategyFunc) => {

  (strategyFunc &&  (typeof strategyFunc === 'function'))?
    passport.use(new LocalStrategy(strategyFunc)):
    (strategyFunc &&  (typeof strategyFunc === 'object'))?
      passport.use(new LocalStrategy(strategyFunc.options, strategyFunc.func)):
      passport.use(new LocalStrategy(optStrategyFunc(userModel)));

  let createUser = (userJson, done) => {
    return (!userJson.password)? 
      done(new Error("Missing password")):
      (() => {
        let result = zxcvbn(userJson.password);
        if (result.score < MIN_PASSWORD_SCORE) return done(new Error("Password is too simple"));
        userModel.create(userJson, function(err, user) {
            if(err) {
                done(err);
            } else {
                done(null, user);
            }
        });
      })();
  }

  return {

    login (req, res, next) {
      passport.authenticate('local', cbLogin(req, res, next))(req, res, next);
    },

    createUser
  };
};
