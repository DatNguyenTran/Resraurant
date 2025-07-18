const express = require("express");
const router = express.Router();
const authController = require("../app/controllers/userController");
const siteController = require("../app/controllers/SiteController"); //BE
router.post("/sign-up", authController.postSignUp);
router.post("/sign-in", authController.postSignIn);
router.post("/reset-password", authController.postResetNewPassword);
router.post("/new-password", authController.postNewPassword);
router.post("/logout", authController.postLogout);
router.get("/verify/:resetToken", authController.getVerify);
router.get("/new-password/:resetToken", authController.getNewPassword);

//FE
router.get("/login", siteController.index);
router.get("/register", siteController.register);
router.get("/reset-password", authController.getResetPassword);
router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleLoginCallback);

module.exports = router;
