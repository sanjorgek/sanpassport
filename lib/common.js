module.exports.login = function(req, res, next) {
  return function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      req.session.messages =  [info.message];
      res.status(403);
      return next(403);
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return next();
    });
  };
};
