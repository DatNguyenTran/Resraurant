require("dotenv").config();
const BookingTable = require("../models/BookingTable");
const RestaurantInfor = require("../models/RestaurantInfor");
const User = require("../models/User");
const Table = require("../models/Table");
const mongoose = require("mongoose");
const moment = require("moment");
const bankId = process.env.BANK_ID;
const accountNo = process.env.ACCOUNT_NO;

class BookingTableController {
  index = async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      if (
        user.firstName == undefined ||
        user.firstName == "" ||
        user.lastName == undefined ||
        user.lastName == "" ||
        user.phoneNumber == undefined ||
        user.phoneNumber == "" ||
        user.address == undefined ||
        user.address == ""
      ) {
        return res.redirect(
          `/users/${userId}?error=${encodeURIComponent(
            "Bạn cần phải nhập đầy đủ thông tin"
          )}`
        );
      }
      const tables = await Table.find();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00 để lấy từ đầu ngày
      const restaurantInfor = await RestaurantInfor.findOne();
      if (restaurantInfor) {
        restaurantInfor.openingHours = moment(restaurantInfor.openingHours).format("HH:mm");
        restaurantInfor.closingHours = moment(restaurantInfor.closingHours).format("HH:mm");
      }

      console.log(restaurantInfor)
      const bookings = await BookingTable.find({ orderDate: { $gte: today } });
      return res.render("bookingTable", {
        user: user,
        tables: tables,
        bookings: bookings,
        restaurantInfor: restaurantInfor,
      });
    } catch (err) {
      console.error("Lỗi tại bookingTable:", err); // Log lỗi ra console
      return res.render("errorpage", {
        message: "Đã có lỗi xảy ra, vui lòng thử lại sau.",
      });
    }
  };

  listBookingManagement = async (req, res, next) => {
    try {
      const bookings = await BookingTable.find()
        .populate("table")
        .populate("customer");
      return res.render("bookingTableManagement", {
        layout: "layouts/mainAdmin",
        title: "admin",
        bookings: bookings,
      });
    } catch (err) {
      console.error("Lỗi tại bookingTable:", err); // Log lỗi ra console
      return res.render("errorpage", {
        message: "Đã có lỗi xảy ra, vui lòng thử lại sau.",
      });
    }
  };

  findAll = async (req, res) => {
    try {
      const bookings = await BookingTable.find();
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  createBooking = async (req, res) => {
  try {
    const moment = require("moment");
    require("moment/locale/vi");

    // Lấy thông tin đặt bàn từ form và tìm bàn theo DB
    const { dateBooking, timeBooking, selectedTableId, requests } = req.body;
    const userId = req.session.user._id;
    const table = await Table.findById(selectedTableId);

    // Ghép ngày và giờ lại thành chuẩn ISO: "2025-05-23T10:00"
    const dateTimeString = `${dateBooking}T${timeBooking}:00Z`;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // thời hạn thanh toán 1 phút

    // ✅ Đến đây thì giờ hợp lệ → tiếp tục tạo hoặc lấy booking
    let bookings = await BookingTable.findOne({
      table: selectedTableId,
      isPaid: false,
      orderDate: dateTimeString,
    });

    if (!bookings) {
      const bookingTable = new BookingTable({
        quantity: table.seatNumber,
        customer: userId,
        table: selectedTableId,
        request: requests,
        orderDate: dateTimeString,
        isPaid: false,
        expiresAt: expiresAt,
      });

      bookings = await bookingTable.save();
    }

    // Định dạng để hiển thị ra trang thanh toán 
    const orderDate = moment.utc(bookings.orderDate);
    const formattedBooking = {
      ...bookings.toObject(),
      orderDay: orderDate
        .format("dddd")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      orderDate: orderDate.format("DD/MM/YYYY"),
      orderTime: orderDate.format("HH:mm"),
    };

    return res.render("payment", {
      bookingTable: formattedBooking,
      amount: table.depositPrice,
      bankId: process.env.B_ID,
      accountNo: process.env.E_NO,
      type: "booking",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


  updateForm = async (req, res) => {
    try {
      const bookingId = req.params.id;
      const bookingOld = await BookingTable.findById(bookingId).populate(
        "table"
      );
      const moment = require("moment");
      require("moment/locale/vi");
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      if (
        user.firstName == undefined ||
        user.firstName == "" ||
        user.lastName == undefined ||
        user.lastName == "" ||
        user.phoneNumber == undefined ||
        user.phoneNumber == "" ||
        user.address == undefined ||
        user.address == ""
      ) {
        return res.redirect(
          `/users/${userId}?error=${encodeURIComponent(
            "Bạn cần phải nhập đầy đủ thông tin"
          )}`
        );
      }
      const tables = await Table.find({
        depositPrice: bookingOld.table.depositPrice,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00 để lấy từ đầu ngày

      const bookings = await BookingTable.find({ orderDate: { $gte: today } });

      const orderDate = moment.utc(bookingOld.orderDate);
      const formattedBooking = {
        ...bookingOld.toObject(),
        orderDay: orderDate
          .format("dddd")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        orderDate: orderDate.format("YYYY-MM-DD"),
        orderTime: orderDate.format("HH:mm"),
      };
      return res.render("editBookingTable", {
        user: user,
        tables: tables,
        bookings: bookings,
        bookingTable: formattedBooking,
      });
    } catch (err) {
      console.error("Lỗi tại bookingTable:", err); // Log lỗi ra console
      return res.render("errorpage", {
        message: "Đã có lỗi xảy ra, vui lòng thử lại sau.",
      });
    }
  };

  updateBookingTable = async (req, res) => {
    try {
      const { id } = req.params;
      const { dateBooking, timeBooking, selectedTableId, requests } = req.body;

      // Kiểm tra xem booking có tồn tại không
      const booking = await BookingTable.findById(id);
      if (!booking) {
        return res.status(404).json({ message: "Không tìm thấy đặt bàn." });
      }

      // Kiểm tra xem bàn có tồn tại không
      if (selectedTableId) {
        const table = await Table.findById(selectedTableId);
        if (!table) {
          return res
            .status(400)
            .json({ message: "Bàn được chọn không hợp lệ." });
        }
      }

      // Gộp ngày và giờ lại thành một Date object theo định dạng ISO 8601
      if (dateBooking && timeBooking) {
        const dateTimeString = `${dateBooking}T${timeBooking}:00Z`;
        booking.orderDate = new Date(dateTimeString);
      }

      booking.table = selectedTableId || booking.table;
      booking.request = requests || booking.request;
      booking.updatedAt = new Date();

      await booking.save();

      res.redirect("/bookingTable/bookingDetail/" + booking._id);
    } catch (error) {
      console.error("Lỗi khi cập nhật đặt bàn:", error);
      res.status(500).json({ message: "Đã có lỗi xảy ra, vui lòng thử lại." });
    }
  };

  delete = async (req, res) => {
    try {
      const deletedBooking = await BookingTable.findByIdAndDelete(
        req.params.id
      );
      if (!deletedBooking)
        return res.status(404).json({ message: "Booking not found." });
      res.status(200).json(deletedBooking);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  historyDetail = async (req, res) => {
    const moment = require("moment");
    require("moment/locale/vi");
    try {
      const booking = await BookingTable.findById(req.params.id)
        .populate("table") // Populate thông tin từ collection `tables`
        .populate("customer"); // Populate thông tin từ collection `customers`

      if (!booking) {
      return res.status(404).render("errorpage", {
        message: "Không tìm thấy đặt bàn!",
      });
    }

      const orderDate = moment.utc(booking.orderDate);
      const formattedBooking = {
        ...booking.toObject(),
        orderDay: orderDate
          .format("dddd") // Lấy thứ (ví dụ: "thứ hai")
          .split(" ") // Tách thành mảng ["thứ", "hai"]
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu của từng từ
          .join(" "), // Ghép lại thành "Thứ Hai"// Viết hoa chữ cái đầu của thứ
        orderDate: orderDate.format("DD/MM/YYYY"),
        orderTime: orderDate.format("HH:mm"), // Tách riêng giờ
      };

      return res.render("historyBookingDetail", {
        bookingDetail: {
          ...formattedBooking,
          isPaid: booking.isPaid
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  bookingHistory = async (req, res, next) => {
    const moment = require("moment");
    require("moment/locale/vi"); // Import ngôn ngữ tiếng Việt

    try {
      const userId = new mongoose.Types.ObjectId(String(req.params.id));
      const now = new Date();

      const bookings = await BookingTable.find({
        customer: userId,
        $or: [
          { isPaid: true },
          { expiresAt: { $gt: now } }
        ]
      }).populate("table");

      // Chuyển đổi ngày
      const formattedBookings = bookings.map((booking) => {
        const orderDate = moment.utc(booking.orderDate);
        return {
          ...booking.toObject(),
          orderDay: orderDate
            .format("dddd")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          orderDate: orderDate.format("DD/MM/YYYY"),
          orderTime: orderDate.format("HH:mm"),
        };
      });

      return res.render("historyBooking", {
        historyBookings: formattedBookings,
      });
    } catch (error) {
      console.log({ message: error.message });
      return res.render("errorpage");
    }
  };

  historyDetailEdit = async (req, res) => {
    const moment = require("moment");
    require("moment/locale/vi");
    try {
      const booking = await BookingTable.findById(req.params.id)
        .populate("table") // Populate thông tin từ collection `tables`
        .populate("customer"); // Populate thông tin từ collection `customers`

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const orderDate = moment.utc(booking.orderDate);
      const formattedBooking = {
        ...booking.toObject(),
        orderDay: orderDate
          .format("dddd") // Lấy thứ (ví dụ: "thứ hai")
          .split(" ") // Tách thành mảng ["thứ", "hai"]
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu của từng từ
          .join(" "), // Ghép lại thành "Thứ Hai"// Viết hoa chữ cái đầu của thứ
        orderDate: orderDate.format("DD/MM/YYYY"),
        orderTime: orderDate.format("HH:mm"), // Tách riêng giờ
      };

      return res.render("historyBookingEdit", {
        bookingDetail: formattedBooking,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  deleteBooking = async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const bookingId = req.params.id; // Sửa lại cách lấy id

      const booking = await BookingTable.findById(bookingId);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy đặt bàn!" });
      }

      await BookingTable.findByIdAndDelete(bookingId);

      res.json({
        success: true,
        redirectURL: `/bookingTable/bookingHistory/${userId}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi server!" });
    }
  };
  
  markAsPaid = async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await BookingTable.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ success: false, message: "Không tìm thấy đặt bàn." });
      }

      if (booking.isPaid) {
        return res.status(200).json({ success: true, message: "Đã được đánh dấu thanh toán từ trước." });
      }

      booking.isPaid = true;
      await booking.save();

      res.json({ success: true, message: "Cập nhật trạng thái đã thanh toán thành công." });
    } catch (err) {
      console.error("❌ Lỗi markAsPaid:", err);
      res.status(500).json({ success: false, message: "Lỗi khi cập nhật trạng thái thanh toán." });
    }
  };
}

module.exports = new BookingTableController();