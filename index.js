const passport = require('passport'),
  debug = require('debug')('sanpassport'),
  local = require('./strategies/local'),
  jwt = require('./strategies/jwt'),
  google = require('./strategies/google.js'),
  passportJWT = require("passport-jwt"),
  ExtractJwt = passportJWT.ExtractJwt,
  zxcvbn = require("zxcvbn");

const serial = (serialise) => {
  return (serialise && (typeof serialise === "function"))?
    serialise:
    (user,done) => {
      return done(null, user.id||user._id);
    };
};

const deserial = (deserialise) => {
  return (deserialise && (typeof deserialise === "function"))?
    deserialise:
    (user,done) => {
      return done(null, user);
    };
};

const asignStrategy = (strategyType, func) => (passport, strategies) => {
  return (strategies[strategyType] && (typeof strategies[strategyType] === "object"))?
    func(passport, strategies[strategyType]):
    {};
};

const initialize = (strategies = {}) => {
  passport.serializeUser(
    deserial(strategies.serialise)
  );

  serial(passport, strategies.serialise);
  passport.deserializeUser(
    deserial(strategies.deserialise)
  );

  let sanpassport = {
    local: asignStrategy("local", local)(passport, strategies),
    google: asignStrategy("google", google)(passport, strategies),
    jwt: asignStrategy("jwt", jwt)(passport, strategies)
  };

  sanpassport.initialize= passport.initialize();
  sanpassport.session= passport.session();

  return sanpassport;
};

module.exports = {
  initialize,
  ExtractJwt,
  zxcvbn
};
