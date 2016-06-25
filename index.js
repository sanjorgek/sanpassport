var LocalStrategy = require('passport-local').Strategy
  , debug = require('debug')('sanpassport')
  , zxcvbn = require("zxcvbn");

const MIN_PASSWORD_SCORE = 2;

module.exports = function (passport, userModel, redirectCB) {
  if(typeof redirectCB != 'function'){
    redirectCB = function (req, res) {
      res.redirect("/");
    }
  }
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    userModel.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(function(username, password, done) {
    userModel.findOne({ username: username }, function(err, user) {
      if (err) {
        debug(err);
        return done(err);
      }
      if (!user) {
        debug("not user");
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
  }));

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.send(403);
  };

  function ensureAdmin(req, res, next) {
    if(req.user && req.user.admin === true)
        next();
    else
        res.send(405);
  };

  function createUser(userJson, done) {
    var result = zxcvbn(userJson.password);
    if (result.score < MIN_PASSWORD_SCORE) return done(new Error("Password is too simple"));
    var user = new userModel(userJson);
    user.save(function(err) {
        if(err) {
            done(err);
        } else {
            done(null, user);
        }
    });
  };
  
  function login(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) {
        req.session.messages =  [info.message];
        return res.send(401)
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return redirectCB(req, res);
      });
    })(req, res, next);
  };

  return {
    ensureAuthenticated: ensureAuthenticated,

    ensureAdmin: ensureAdmin,

    createUser : createUser,
    
    login: login,
    
    initialize: passport.initialize,
    
    session: passport.session
  };
}
