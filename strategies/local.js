var LocalStrategy = require('passport-local').Strategy,
  cbLogin = require('../lib/common').login,
  debug = require('debug')('sanpassport:local'),
  zxcvbn = require("zxcvbn");

const MIN_PASSWORD_SCORE = 2;

module.exports = function (passport, userModel, strategyFunc) {

  function optStrategyFunc(username, password, done) {
    userModel.findOne({ username: username }, function(err, user) {
      if (err) {
        debug(err);
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Unknown user ' + username });
      }
      user.comparePassword(password, function(err, isMatch) {
        if (err){
          debug(err);
          return done(err);
        }
        if(isMatch) {
          return done(null, user);
        } else {
          debug("don't match");
          return done(null, false, { message: 'Invalid password' });
        }
      });
    });
  }

  if(strategyFunc &&  (typeof strategyFunc === 'function')){
    passport.use(new LocalStrategy(strategyFunc));
  }else if(strategyFunc &&  (typeof strategyFunc === 'object')){
    passport.use(new LocalStrategy(strategyFunc.options, strategyFunc.func));
  }else{
    passport.use(new LocalStrategy(optStrategyFunc));
  }

  function ensureAdmin(req, res, next) {
    if(req.user && req.user.admin === true) next();
    else{
        res.status(401);
        next(401);
    }
  }

  function createUser(userJson, done) {
    if(userJson.password){
      let result = zxcvbn(userJson.password);
      if (result.score < MIN_PASSWORD_SCORE) return done(new Error("Password is too simple"));
      userModel.create(userJson, function(err, user) {
          if(err) {
              done(err);
          } else {
              done(null, user);
          }
      });
    }else{
      done(new Error("Missing password"));
    }
  }

  function login(req, res, next) {
    passport.authenticate('local', cbLogin(req, res, next))(req, res, next);
  }

  return {

    createUser : createUser,

    login: login
  };
};
