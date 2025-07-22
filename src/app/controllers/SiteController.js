class SiteController {
  // [Get] /news
  index(req, res, next) {
    if (req.session.user) {
      return res.redirect("/");
    }
    res.render("login", { layout: "layouts/auth", title: "Login" });
  }

  register(req, res, next) {
    if (req.session.user) {
      return res.redirect("/");
    }

    const isTrial = req.query.trial === "true";
    const guestId = req.query.guestId;
    const plan = req.query.plan;

    if (guestId) req.session.guestId = guestId;
    if (plan) req.session.plan = plan;

    res.render("register", {
      layout: "layouts/auth",
      title: "Register",
      trial: isTrial ? "true" : "false",
      guestId,
      plan,
    });
  }

  home(req, res) {
    res.render("home");
  }

  homeAdmin(req, res, next) {
    res.render("admin", { layout: "layouts/mainAdmin", title: "admin" });
  }

  aboutUs(req, res, next) {
    res.render("aboutUs");
  }
}
module.exports = new SiteController();
