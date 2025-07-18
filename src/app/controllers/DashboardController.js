const User = require("../models/User");
const Table = require("../models/Table");
const Menu = require("../models/Menu");
const Ingredient = require("../models/Ingredient");
const OrderFood = require("../models/OrderFood");
const Revenue = require("../models/Revenue");
const mongoose = require("mongoose");
exports.getTableStatus = async (req, res) => {
  try {
    const total = await Table.countDocuments();
    const available = await Table.countDocuments({ status: "AVAILABLE" });
    const occupied = await Table.countDocuments({ status: "OCCUPIED" });
    const reserved = await Table.countDocuments({ status: "RESERVED" });

    res.json({
      total,
      available,
      occupied,
      reserved,
    });
  } catch (error) {
    console.error("Lỗi lấy tình trạng bàn:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTopDishes = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurant;
    if (!restaurantId) {
      return res.status(400).json({ error: "Thiếu thông tin nhà hàng" });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 30);

    const orders = await OrderFood.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: daysAgo },
        },
      },
      { $unwind: "$dishes" },
      {
        $group: {
          _id: "$dishes.menuItem",
          totalOrdered: { $sum: "$dishes.quantity" },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "menus",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $project: {
          _id: 0,
          name: "$menuItem.foodName",
          totalOrdered: 1,
        },
      },
    ]);

    console.log("Orders found:", orders);

    res.json(orders);
  } catch (err) {
    console.error("Lỗi lấy top món ăn:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getRevenueByDay = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurant;
    if (!restaurantId)
      return res.status(400).json({ error: "Thiếu thông tin nhà hàng" });

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const revenue = await Revenue.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: start, $lte: end },
          status: "PAID",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalSessions: { $sum: 1 },
        },
      },
    ]);

    console.log("💰 Doanh thu hôm nay:", revenue);

    res.json({
      date: start.toISOString().split("T")[0],
      totalRevenue: revenue[0]?.totalRevenue || 0,
      totalSessions: revenue[0]?.totalSessions || 0,
    });
  } catch (err) {
    console.error("❌ Lỗi getRevenueByDay:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRevenueByMonth = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurant;
    if (!restaurantId)
      return res.status(400).json({ error: "Thiếu thông tin nhà hàng" });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const revenue = await Revenue.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: firstDay, $lte: lastDay },
          status: "PAID",
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          dailyTotal: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    // Fill ngày trống
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyRevenue = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const found = revenue.find((r) => r._id.day === day);
      dailyRevenue.push({
        day,
        dailyTotal: found ? found.dailyTotal : 0,
      });
    }

    console.log("📅 Doanh thu tháng:", dailyRevenue);
    res.json({
      month: `${year}-${(month + 1).toString().padStart(2, "0")}`,
      dailyRevenue,
    });
  } catch (err) {
    console.error("❌ Lỗi getRevenueByMonth:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurant;
    if (!restaurantId) {
      return res.status(400).send("Thiếu thông tin nhà hàng trong user.");
    }

    // Lấy số lượng nhân viên (user có role RESMANAGER, WAITER, hoặc KITCHENSTAFF)
    const totalEmployees = await User.countDocuments({
      role: { $in: ["RESMANAGER", "WAITER", "KITCHENSTAFF"] },
      restaurant: restaurantId,
    });
    console.log("Total employees:", totalEmployees);

    // Lấy số lượng bàn
    const totalTables = await Table.countDocuments({
      restaurant: restaurantId,
    });
    console.log("Total tables:", totalTables);

    // Lấy số lượng món ăn
    const totalDishes = await Menu.countDocuments({ restaurant: restaurantId });
    console.log("Total dishes:", totalDishes);

    // Lấy số lượng nguyên liệu
    const totalIngredients = await Ingredient.countDocuments({
      restaurant: restaurantId,
    });
    console.log("Total ingredients:", totalIngredients);

    // Truyền dữ liệu đến view
    res.render("admin", {
      layout: "layouts/mainAdmin",
      title: "Admin Dashboard",
      totalEmployees,
      totalTables,
      totalDishes,
      totalIngredients,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Server Error");
  }
};
