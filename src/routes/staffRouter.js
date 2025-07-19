const express = require("express");
const staffRouter = express.Router();
const staffController = require("../app/controllers/staffController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

staffRouter.get(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  staffController.getStaffs
);

staffRouter.get(
  "/create",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  staffController.create
);

staffRouter.get(
  "/detail/:userId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  staffController.getStaffDetail
);

staffRouter.get(
  "/update/:userId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  staffController.update
);

staffRouter.post(
  "/update/:userId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  staffController.updateStaff
);

staffRouter.post(
  "/create",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  staffController.createStaff
);

staffRouter.post(
  "/lock/:id",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  staffController.lockStaff
);

module.exports = staffRouter;
