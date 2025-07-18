const express = require("express");
const router = express.Router();
const DashboardController = require("../app/controllers/DashboardController");
const isAuth = require("../app/middlewares/is-auth");
router.get("/", isAuth.requireAuth, DashboardController.getDashboard);
router.get(
  "/api/table-status",
  isAuth.requireAuth,
  DashboardController.getTableStatus
);
router.get(
  "/api/top-dishes",
  isAuth.requireAuth,
  DashboardController.getTopDishes
);
// API lấy doanh thu hôm nay
router.get(
  "/api/revenue/daily",
  isAuth.requireAuth,
  DashboardController.getRevenueByDay
);
// API lấy doanh thu theo tháng
router.get(
  "/api/revenue/monthly",
  isAuth.requireAuth,
  DashboardController.getRevenueByMonth
);

module.exports = router;
