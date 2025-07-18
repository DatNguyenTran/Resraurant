const express = require("express");
const router = express.Router();
const upload = require("../config/multer/index");
const newsController = require("../app/controllers/EditNewsController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

router.get(
  "/",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.getList
);
router.get(
  "/detail/:id",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.renderDetailNews
);
router.delete(
  "/:id",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.deleteNews
);
router.get(
  "/add",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.renderCreateForm
);
router.get(
  "/edit/:id",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.renderEditForm
);
router.put(
  "/:id",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  upload.single("image"),
  newsController.updateNews
);
router.post(
  "/",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  upload.single("image"),
  newsController.createNews
);
router.delete(
  "/",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.deleteNews
);
router.put(
  "/",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.updateNews
);
router.get(
  "/search",
  isAuth.requireAuth,
  isPermissions(["ADMIN"]),
  newsController.searchNews
);

module.exports = router;
