const express = require("express");
const router = express.Router();
const tablesController = require("../app/controllers/TablesController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");

// GET: List all tables
router.get(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  tablesController.getTables
);

// GET: Show form to add a new table
router.get(
  "/add",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  tablesController.addTables
);

// POST: Create a new table
router.post(
  "/create",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  tablesController.upload.single("image"),
  tablesController.createTables
);

// GET: Show form to edit a table
router.get(
  "/edit/:tableId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  tablesController.getEditTableForm
);

router.post(
  "/edit/:tableId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  tablesController.upload.single("image"),
  tablesController.updateTable
);

// GET: Delete a table
router.post(
  "/delete/:tableId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  tablesController.deleteTable
);

router.post(
  "/api/reset-table/:id",
  isAuth.requireAuth,
  isPermissions(["RESOWNER"]),
  (req, res, next) => {
      console.log("🛠 Route hit: POST /api/reset-table/" + req.params.id);
      next();
  },
  tablesController.resetTable
);

module.exports = router;
