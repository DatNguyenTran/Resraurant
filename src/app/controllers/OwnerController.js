const User = require("../models/User");
const RestaurantInfor = require("../models/RestaurantInfor");
const Order = require("../models/OrderFood");
const SubscriptionLog = require("../models/SubscriptionLog");
const bankMap = {
  "970430": "TPBank",
  "970436": "Vietcombank",
  "970407": "Techcombank",
  "970415": "VietinBank",
  "970405": "Agribank",
  "970443": "VPBank",
  "970432": "Sacombank",
};

exports.getResOwnerDashboard = async (req, res) => {
  try {
    const { search = "", subscription = "", status = "" } = req.query;
    const filter = { role: "RESOWNER" };

    if (subscription) filter["subscription.type"] = subscription;
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { email: regex },
        { phoneNumber: regex },
        { firstName: regex },
      ];
    }

    const resowners = await User.find(filter)
      .populate("restaurant")
      .sort({ createdAt: -1 })
      .lean();

    res.render("ownerDashboard", {
      layout: "layouts/mainAdmin",
      resowners: resowners.map((o) => ({
        ...o,
        restaurantName: o.restaurant?.restaurantName || "N/A",
        bankInfo: o.restaurant?.bankInfo || {},
      })),
      bankMap,
      pagination: "" 
    });
  } catch (err) {
    console.error("[ERROR] Loading RESOWNER dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const owner = await User.findById(req.params.id);
    if (!owner || owner.role !== "RESOWNER") return res.status(404).send("Not found");

    owner.status = owner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await owner.save();
    res.redirect("/owner/users");
  } catch (err) {
    console.error("[ERROR] Toggling status:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.getSystemReportDashboard = async (req, res) => {
  try {
    // Tổng số nhà hàng
    const totalRestaurants = await User.countDocuments({ role: "RESOWNER" });

    // Tổng số người dùng (trừ ADMIN)
    const totalUsers = await User.countDocuments({ role: { $ne: "ADMIN" } });

    // Tổng gói tháng đã thanh toán
    const totalMonthlyPlans = await SubscriptionLog.countDocuments({
      plan: "monthly",
      paid: true
    });

    // Tổng gói năm đã thanh toán
    const totalYearlyPlans = await SubscriptionLog.countDocuments({
      plan: "yearly",
      paid: true
    });

    // Tổng doanh thu từ SubscriptionLog
    const revenueResult = await SubscriptionLog.aggregate([
      { $match: { paid: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Doanh thu theo tháng (SubscriptionLog)
    const systemRevenue = await SubscriptionLog.aggregate([
      { $match: { paid: true } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format lại dữ liệu để gửi sang view
    const systemRevenueFormatted = Array.from({ length: 12 }, (_, i) => {
      const monthData = systemRevenue.find(item => item._id === i + 1);
      return {
        _id: i + 1,
        total: monthData ? monthData.total : 0
      };
    });

    // Render view
    res.render("ownerReportDashboard", {
      layout: "layouts/mainAdmin",
      title: "Báo Cáo Hệ Thống",
      totalRestaurants,
      totalUsers,
      totalMonthlyPlans,
      totalYearlyPlans,
      totalRevenue,
      systemRevenue: JSON.stringify(systemRevenueFormatted)
    });
  } catch (err) {
    console.error("[ERROR] Loading system report dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
};
