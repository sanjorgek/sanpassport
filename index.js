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

const initialize = (strategies = {}) => {
  passport.serializeUser(
    deserial(strategies.serialise)
  )

  serial(passport, strategies.serialise);
  passport.deserializeUser(
    deserial(strategies.deserialise)
  );

  let sanpassport = {};

  if(strategies.local && (typeof strategies.local === "object"))
    sanpassport.local = local(passport, strategies.local);
  if(strategies.google && (typeof strategies.google === "object"))
    sanpassport.google = google(passport, strategies.google);
  if(strategies.jwt && (typeof strategies.jwt === "object"))
    sanpassport.jwt = jwt(passport, strategies.jwt);

  sanpassport.initialize= passport.initialize();
  sanpassport.session= passport.session();

  return sanpassport;
};

module.exports = {
  initialize,
  ExtractJwt,
  zxcvbn
};
