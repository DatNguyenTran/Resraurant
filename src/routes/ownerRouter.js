const express = require("express");
const router = express.Router();
const ownerController = require("../app/controllers/OwnerController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

router.get(
  "/users",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  ownerController.getResOwnerDashboard
);

router.post(
  "/toggle/:id",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  ownerController.toggleStatus
);

router.get(
  "/reports",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  ownerController.getSystemReportDashboard
);

module.exports = router;