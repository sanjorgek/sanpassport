const passport = require('passport'),
  debug = require('debug')('sanpassport'),
  local = require('./strategies/local'),
  google = require('./strategies/google.js');

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

module.exports = (strategies = {}) => {
  passport.serializeUser(
    deserial(strategies.serialise)
  )

  serial(passport, strategies.serialise);
  passport.deserializeUser(
    deserial(strategies.deserialise)
  );

  let sanpassport = {};
  sanpassport.local = local(passport, strategies.local);
  sanpassport.google = google(passport, strategies.google);

  sanpassport.initialize= passport.initialize();
  sanpassport.session= passport.session();

  return sanpassport;
};
