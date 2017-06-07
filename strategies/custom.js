const CustomStrategy = require("passport-custom");

module.exports = (sanpassport) => (passport, strategies = {}) => {
  _.forEach(strategies, (value, key) => {
    passport.use(key, new CustomStrategy(value.func));
    sanpassport[key] = passport.authenticate('custom', { failureRedirect: '/login' });
  });
};
