const jwt = require('jsonwebtoken');
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const debug = require('debug')('sanpassport:jwt');

module.exports = (passport, strategy) => {
  let options = {};
  passport.use(new JwtStrategy(strategy.options, strategy.func));
  jwt.authenticate = passport.authenticate('jwt', { session: false });
  return jwt;
};
