const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../app/middlewares/is-auth");
const userController = require("../app/controllers/userController");
const isPermissions = require("../app/middlewares/isPermissions");

const userRoutes = express.Router();

userRoutes.use(express.json());
userRoutes.use(express.urlencoded({ extended: true }));

userRoutes.post("/", userController.create);
userRoutes.post(
  "/update-profile/:id",
  isAuth.requireAuth,
  userController.upload.single("avatar"),
  userController.updateProfile
);
userRoutes.get(
  "/update-profile/:id",
  isAuth.requireAuth,
  userController.renderUpdateProfilePage
);
userRoutes.get(
  "/change-password/:id",
  isAuth.requireAuth,
  userController.renderChangePasswordPage
);
userRoutes.post(
  "/change-password/:id",
  isAuth.requireAuth,
  userController.changePassword
);
userRoutes.put(
  "/change-password/:id",
  isAuth.requireAuth,
  userController.changePassword
);

userRoutes.use("/:id", (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.render("errorpage");
  }
  next();
});

userRoutes.get("/:id", isAuth.requireAuth, userController.findById);

userRoutes
  .route("/:id", isAuth.requireAuth, isPermissions(["RESOWNER", "RESMANAGER"]))
  .delete(userController.delete);

module.exports = userRoutes;
