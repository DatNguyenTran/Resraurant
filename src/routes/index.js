const express = require("express");
const authRouter = require("./authRouter");
const siteRouter = require("./siteRouter");
const bookingRouter = require("./bookingTableRouter");
const restaurantRouter = require("./restaurantsRouter");
const { getFooterData } = require("../app/controllers/RestaurantsController");
const userRoutes = require("./usersRoutes");
const isAuth = require("../app/middlewares/is-auth");
const BookingTable = require("../app/models/BookingTable");
const Table = require("../app/models/Table");
const User = require("../app/models/User");
const staffRouter = require("./staffRouter");
const router = express.Router();
const menuRoutes = require("./menuRoutes");
const payment = require("./paymentRoutes");
const ingredientsRouter = require("./ingredientsRouter");
const adminRouter = require("./adminRouter");
const checkSubscription = require("../app/middlewares/checkSubscription");
const orderRoutes = require("./orderRoutes");
const tableRouter = require("./tablesRouter");
const { getAllTable } = require("../app/controllers/TablesController");
const editMenuRoutes = require("./editMenuRoutes");
const takeCareRouter = require("./takecareRouter");
const newsRoutes = require("./newsRoutes");
const editNewsRoutes = require("./editNewsRoutes");
const ownerRoutes = require("./ownerRouter");

function routes(app) {
  app.use("/news", isAuth.setUser, getFooterData, newsRoutes);
  app.use("/owner/adminNews", isAuth.setUser, editNewsRoutes);
  app.use("/menu", isAuth.setUser, getFooterData, menuRoutes);
  app.use("/admin/editMenu", isAuth.setUser, editMenuRoutes);
  app.use("/owner", isAuth.setUser, ownerRoutes);

  app.use("/restaurantInfor", isAuth.setUser, getFooterData, restaurantRouter);
  app.use("/auth", authRouter);
  app.use("/", isAuth.setUser, getFooterData, siteRouter);
  app.use("/order", orderRoutes);
  app.use("/admin", isAuth.setUser, checkSubscription, adminRouter);

  app.use("/bookingTable", bookingRouter);
  app.use("/payment", payment);
  app.use("/users", userRoutes);
  app.use("/admin/staffs", staffRouter);
  app.use("/admin/takeCare", takeCareRouter);
  app.use("/admin/tables", tableRouter);
  app.use("/admin/editIngredient", isAuth.requireAuth, ingredientsRouter);
}

module.exports = routes;
