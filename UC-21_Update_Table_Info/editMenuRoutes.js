const express = require("express");

const router = express.Router();
const upload = require("../config/multer/index");
const menuController = require("../app/controllers/EditMenuController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

router.get("/", isAuth.requireAuth, menuController.getList);
router.get("/detail/:id", isAuth.requireAuth, menuController.renderDetailDish);
router.delete("/:id", isAuth.requireAuth, menuController.deleteDish);
router.get(
  "/add",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  menuController.renderCreateForm
);
router.get(
  "/edit/:id",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  menuController.renderEditForm
);
router.put(
  "/:id",
  upload.single("image"),
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  menuController.updateDish
);
router.post(
  "/",
  upload.single("image"),
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  menuController.createDish
);
router.delete(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  menuController.deleteDish
);
router.put(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  menuController.updateDish
);
// router.get(
//   "/search",
//   isAuth.requireAuth,
//   isPermissions(["RESOWNER"]),
//   menuController.searchDish
// );

module.exports = router;
