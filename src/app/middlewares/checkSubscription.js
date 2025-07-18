module.exports = (req, res, next) => {
  const user = req.session.user;

  if (!user) return res.redirect("/auth/login");

  const now = new Date();
  const trialEnd = new Date(user.subscription?.trialEnd);

  if (user.subscription?.type === "TRIAL" && now > trialEnd) {
    req.session.destroy((err) => {
      if (!res.headersSent) {
        return res.redirect("/auth/login?expired=1");
      }
    });
    return;
  }

  if (user.subscription?.type === "EXPIRED") {
    req.session.destroy((err) => {
      if (!res.headersSent) {
        return res.redirect("/auth/login?expired=1");
      }
    });
    return;
  }

  next();
};