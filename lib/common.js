module.exports.login = (req, res, next) => (err, user, info) =>{
  return (err)? 
    next(err):
    (!user)? 
      (() => {
        req.session.messages =  [info.message];
        res.status(403);
        return next(403);
      })():
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return next();
      });
};
