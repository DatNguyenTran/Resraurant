module.exports = {
  requireAuth: (req, res, next) => {
    const user = req.session.user;
    if (!user) {
      return res.redirect("/auth/login");
    }

    req.user = user; 
    res.locals.user = user; 
    next();
  },

  setUser: (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
  },

  checkRoleOwner: (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "RESOWNER") {
      return res.redirect("/");
    }
    next();
  }
};
