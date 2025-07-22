const express = require("express");
const router = express.Router();
const orderController = require("../app/controllers/OrderController");
const isAuth = require("../app/middlewares/is-auth");
const isPermissions = require("../app/middlewares/isPermissions");
router.get(
  "/",
  isAuth.requireAuth,
  isPermissions(["RESOWNER", "KITCHENSTAFF", "WAITER", "RESMANAGER"]),
  orderController.viewAllTables
);
router.get(
  "/chef",
  isAuth.requireAuth,
  isPermissions(["RESOWNER", "KITCHENSTAFF", "WAITER", "RESMANAGER"]),
  orderController.chefViewDishes
);
router.get(
  "/dishes-of-day",
  isAuth.requireAuth,
  isPermissions(["RESOWNER", "KITCHENSTAFF", "WAITER", "RESMANAGER"]),
  orderController.chefGetDishesOfDay
);
router.get(
  "/:tableId",
  isAuth.requireAuth,
  isPermissions(["RESOWNER", "KITCHENSTAFF", "WAITER", "RESMANAGER"]),
  orderController.viewATable
);
router.post("/", isAuth.requireAuth, orderController.addDishes2Table);
router.get("/order-of-table/:tableId", isAuth.requireAuth, orderController.getOrderOfTableID);
router.put(
  "/change-dish-status",
  isAuth.requireAuth,
  isPermissions(["RESOWNER", "KITCHENSTAFF", "WAITER", "RESMANAGER"]),
  orderController.chefChangeDishStatus
);
router.put('/hide-dish/:orderId/:dishId', isAuth.requireAuth, orderController.hideDish);

module.exports = router;
