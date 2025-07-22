const Table = require("../models/Table");
const Menu = require("../models/Menu");
const Order = require("../models/OrderFood");
const Revenue = require("../models/Revenue");
const mongoose = require("mongoose");
exports.viewAllTables = async (req, resp) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // Đặt thời gian về 23:59:59

  const user = req.session.user;
  if (!user) {
    return resp.status(401).send("Chưa đăng nhập.");
  }

  const tables = await Table.aggregate([
    {
      $match: {
        restaurant: new mongoose.Types.ObjectId(req.user.restaurant),
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "table",
        as: "orders",
      },
    },
    {
      $addFields: {
        isInUse: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$orders",
                  as: "order",
                  cond: {
                    $and: [
                      {
                        $gte: [
                          { $arrayElemAt: ["$$order.dishes.orderDate", 0] },
                          todayStart,
                        ],
                      },
                      {
                        $lte: [
                          { $arrayElemAt: ["$$order.dishes.orderDate", 0] },
                          todayEnd,
                        ],
                      },
                      { $eq: ["$$order.statusPayment", "Pending"] },
                    ],
                  },
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $project: {
        orders: 0,
      },
    },
  ]);
  resp.render("order/tables", { tables, layout: "layouts/mainAdmin" });
};

exports.viewATable = async (req, resp) => {
  const tableId = req.params.tableId;
  const table = await Table.findOne({
    idTable: tableId,
    restaurant: req.user.restaurant,
  });
  if (!table) {
    return resp.status(404).send("Table not found");
  }
  const menus = await Menu.find({ restaurant: req.user.restaurant });
  console.log("🪑 Table render ra view:", table);
  resp.render("order/view1Table", {
    table,
    menus,
    layout: "layouts/mainAdmin",
  });
};
exports.addDishes2Table = async (req, resp) => {
  try {
    const { tableId, dishes } = req.body;
    console.log("📥 Dữ liệu nhận từ client:", { tableId, dishes });

    // Lấy thông tin bàn và session hiện tại
    const table = await Table.findOne({
      _id: tableId,
      restaurant: req.user.restaurant,
    });
    if (!table) {
      console.error("❌ Không tìm thấy bàn:", tableId);
      return resp.status(404).send("Table not found with id: " + tableId);
    }
    const currentSession = table.session;
    console.log("✅ Tìm thấy bàn:", table.idTable, "Session:", currentSession);

    //Đếm số lượng từng món
    const countMap = dishes.reduce((acc, dishId) => {
      acc[dishId] = (acc[dishId] || 0) + 1;
      return acc;
    }, {});
    console.log("🧾 Số lượng từng món:", countMap);

    const uniqueDishIds = Object.keys(countMap);
    const counts = Object.values(countMap);

    // Lấy thông tin món ăn từ DB
    const addDishes = await Menu.find({
      _id: { $in: uniqueDishIds },
      restaurant: req.user.restaurant,
    });
    console.log(
      "🍽️ Món ăn tìm thấy trong DB:",
      addDishes.map((d) => d.foodName)
    );

    if (!addDishes.length) {
      console.warn("⚠️ Không tìm thấy món nào trong DB.");
      return resp.status(404).json({ message: "No dishes found" });
    }
    // Sắp xếp món ăn theo thứ tự gọi
    const sortedDishes = uniqueDishIds.map((id) =>
      addDishes.find((dish) => dish._id.toString() === id)
    );
    console.log(
      "📦 Món ăn đã sắp xếp:",
      sortedDishes.map((d) => d?.foodName)
    );

    // Tạo mảng dishes để thêm vào order
    const dishes2Add = [];
    let addedTotal = 0;
    for (let i = 0; i < sortedDishes.length; i++) {
      const dishPrice = Number(sortedDishes[i].price) * counts[i];
      addedTotal += dishPrice;

      dishes2Add.push({
        menuItem: sortedDishes[i],
        quantity: counts[i],
        statusOrder: "Pending",
        typeOrder: "Offline",
      });
    }
    console.log("📝 Dishes chuẩn bị thêm vào order:", dishes2Add);
    console.log(`💸 Tổng giá trị món vừa thêm: ${addedTotal} VND`);

    // Tìm order Pending hiện tại của bàn trong session hiện tại
    let order = await Order.findOne({
      table: tableId,
      session: currentSession,
      statusPayment: "Pending",
    })
      .populate({
        path: "dishes.menuItem",
        match: { restaurant: req.user.restaurant },
      })
      .populate("table")
      .populate("bookingTable");

    if (!order) {
      console.log("📦 Không tìm thấy order Pending ➝ tạo mới");
      // Nếu chưa có order ➝ Tạo mới
      const newOrder = new Order({
        table: table,
        session: currentSession,
        dishes: dishes2Add,
        statusPayment: "Pending",
        paymentMethod: "Cash",
        restaurant: req.user.restaurant,
      });
      await newOrder.save();
      order = newOrder; // 👈 Gán lại để dùng tiếp phía sau
      console.log("✅ Order mới đã được tạo:", newOrder._id);
    } else {
      console.log("📦 Đã tìm thấy order Pending:", order._id);
      // Nếu đã có order ➝ Cộng thêm món hoặc tăng số lượng
      for (let i = 0; i < dishes2Add.length; i++) {
        let found = false;
        for (let j = 0; j < order.dishes.length; j++) {
          if (
            dishes2Add[i].menuItem._id.toString() ===
            order.dishes[j].menuItem._id.toString()
          ) {
            console.log(
              `🔄 Tăng số lượng món ${order.dishes[j].menuItem.foodName}`
            );
            order.dishes[j].quantity += dishes2Add[i].quantity;
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(
            `➕ Thêm món mới vào order: ${dishes2Add[i].menuItem.foodName}`
          );
          order.dishes.push(dishes2Add[i]);
        }
      }
    }
    // Cập nhật totalPrice cho order
    const newTotalPrice =
      order.dishes?.reduce((sum, dish) => {
        return sum + dish.quantity * dish.menuItem.price;
      }, 0) || 0;
    order.totalPrice = newTotalPrice;

    await order.save();
    console.log(
      `✅ Order ${order._id} đã được cập nhật. Tổng tiền: ${newTotalPrice} VND`
    );

    // 📝 Ghi doanh thu ngay khi thêm món
    await Revenue.create({
      restaurant: req.user.restaurant,
      table: table._id,
      session: currentSession,
      amount: addedTotal,
      status: "PAID",
      description: `Ghi doanh thu khi thêm món vào bàn ${table.idTable} (session ${currentSession})`,
    });
    console.log(
      `💰 Ghi doanh thu ${addedTotal} VND cho bàn ${table.idTable} (session ${currentSession})`
    );

    resp.json({ message: "Thêm món ăn thành công." });
  } catch (error) {
    console.error("Lỗi addDishes2Table:", error);
    resp.status(500).json({ message: "Server error" });
  }
};

exports.getOrderOfTableID = async (req, resp) => {
  const tableId = req.params.tableId;

  const table = await Table.findById(tableId);
  if (!table) {
    return resp.status(404).json({ error: "Không tìm thấy bàn" });
  }

  const orders = await Order.find({
    table: tableId,
    session: table.session,
    statusPayment: "Pending",
    restaurant: req.user.restaurant,
  })
    .populate("dishes.menuItem")
    .populate("table")
    .populate("bookingTable");
  if (orders.length > 1) {
    return resp
      .status(500)
      .json({ error: "Lỗi hệ thống, tìm thấy nhiều hơn 1 order cho bàn này." });
  }
  if (orders.length === 0) {
    return resp.json(null);
  }
  return resp.json(orders[0]);
};

exports.chefViewDishes = async (req, resp) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.aggregate([
      {
        $addFields: {
          firstDishOrderDate: { $arrayElemAt: ["$dishes.orderDate", 0] }, // Extract dishes[0].orderDate
        },
      },
      {
        $match: {
          firstDishOrderDate: { $gte: startOfDay, $lte: endOfDay },
          restaurant: new mongoose.Types.ObjectId(req.user.restaurant),
        },
      },
      { $unwind: "$dishes" }, // Unwind dishes
      { $sort: { "dishes.orderDate": 1 } }, // Sort by orderDate (oldest to latest)
    ]);
    resp.render("order/chef", { layout: "layouts/mainAdmin", orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};
exports.chefGetDishesOfDay = async (req, resp) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Lấy danh sách bàn để lấy session hiện tại của từng bàn
    const tables = await Table.find({ restaurant: req.user.restaurant }).select(
      "_id session"
    );
    const sessionMap = {};
    tables.forEach((t) => {
      sessionMap[t._id.toString()] = t.session;
    });

    const orders = await Order.aggregate([
      {
        $match: {
          restaurant: new mongoose.Types.ObjectId(req.user.restaurant),
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $addFields: {
          firstDishOrderDate: { $arrayElemAt: ["$dishes.orderDate", 0] }, // Extract dishes[0].orderDate
        },
      },
      { $unwind: "$dishes" }, // Unwind dishes array
      {
        $lookup: {
          from: "tables", // Join with Table collection
          localField: "table",
          foreignField: "_id",
          as: "tableData",
        },
      },
      { $unwind: "$tableData" }, // Convert table array to object
      {
        $lookup: {
          from: "menus", // Join with Menu collection
          localField: "dishes.menuItem",
          foreignField: "_id",
          as: "dishes.menuData",
        },
      },
      { $unwind: "$dishes.menuData" }, // Convert menuData array to object
      {
        $match: {
          $expr: {
            $and: [{ $ne: ["$dishes.statusOrder", "Hidden"] }],
          },
        },
      },
      { $sort: { "dishes.orderDate": 1 } }, // Sort by orderDate (oldest first)
    ]);

    resp.json(orders);
  } catch (error) {
    console.error("Error fetching orders for chef:", error);
    resp.status(500).json({ error: "Server error while fetching orders" });
  }
};

exports.chefChangeDishStatus = async (req, resp) => {
  const { orderId, dishId, status } = req.body;
  const order = await Order.findOne({
    _id: orderId,
    restaurant: req.user.restaurant,
  });
  if (!order) {
    return resp.status(500).json({ error: "Order not found" });
  }
  const dish = order.dishes.find((dish) => dish._id.toString() === dishId);
  if (!dish) {
    return resp.status(500).json({ error: "Dish not found" });
  }
  dish.statusOrder = status;
  await order.save();
  return resp.json({ message: "Change dish status successfully" });
};

exports.hideDish = async (req, res) => {
  try {
    const { orderId, dishId } = req.params;
    const result = await Order.updateOne(
      { _id: orderId, "dishes._id": dishId },
      { $set: { "dishes.$.statusOrder": "Hidden" } }
    );
    if (result.nModified === 0) {
      return res.status(404).json({ error: "Không tìm thấy món để ẩn" });
    }
    res.json({ message: "Món đã được ẩn khỏi giao diện bếp." });
  } catch (err) {
    console.error("Lỗi ẩn món:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};
