const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/SiteController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

router.get("/", siteController.home);
router.get("/home", siteController.home);
// router.get(
//   "/admin",
//   isAuth.requireAuth,
//   isPermissions(["RESOWNER", "RESMANAGER", "WAITER", "KITCHENSTAFF"]),
//   siteController.homeAdmin
// );
router.get("/aboutUs", siteController.aboutUs);

module.exports = router;
