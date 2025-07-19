// /routes/ingredientsRouter.js
const express = require("express");
const router  = express.Router();
const isAuth  = require("../app/middlewares/is-auth");
const ctrl    = require("../app/controllers/IngredientsController.js");

// Danh sách kho
router.get("/",              isAuth.requireAuth, ctrl.list);

// Tạo mới
router.get("/create",        isAuth.requireAuth, ctrl.renderCreate);
router.post("/create",       isAuth.requireAuth, ctrl.create);

// Sửa – Xóa
router.get ("/edit/:id",     isAuth.requireAuth, ctrl.renderEdit);
router.put("/edit/:id",     isAuth.requireAuth, ctrl.update);
router.post("/delete/:id",   isAuth.requireAuth, ctrl.remove);

module.exports = router;
