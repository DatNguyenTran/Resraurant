const express = require("express");
const takeCareRouter = express.Router();
const takeCareController = require("../app/controllers/TakeCareController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

takeCareRouter.get(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  takeCareController.getTakeCares
);

takeCareRouter.get(
  "/create",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  takeCareController.renderCreateTakeCare
);

takeCareRouter.get(
  "/detail/:id",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  takeCareController.renderDetailTakeCare
);

takeCareRouter.post(
  "/create",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  takeCareController.createTakeCare
);

takeCareRouter.get(
  "/update/:id",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  takeCareController.renderUpdateTakeCare
);

takeCareRouter.post(
  "/update/:id",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  takeCareController.updateTakeCare
);

takeCareRouter.post(
  "/delete/:id",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  takeCareController.deleteTakeCare
);

takeCareRouter.get(
  "/staff/:userId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER", "RESMANAGER", "WAITER", "KITCHENSTAFF"]),
  takeCareController.getStaffSchedule
);

module.exports = takeCareRouter;
