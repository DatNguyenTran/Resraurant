module.exports = (roles) => (req, res, next) => {
  if (!roles.includes(req.session.user.role)) {
    res.redirect("/");
  } else {
    next();
  }
};
