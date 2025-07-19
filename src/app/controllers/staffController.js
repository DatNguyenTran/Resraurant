const User = require("../models/User");
const bcrypt = require("bcrypt");
const StaffInfor = require("../models/StaffInfor");
const { sendMail } = require("../../config/email");
const { genarateResetToken } = require("../../util");
const mongoose = require("mongoose");

exports.getStaffs = async (req, res) => {
  console.log("🔍 req.user =", req.user);
  try {
    if (!req.user || !req.user.restaurant) {
      return res.status(403).render("errorpage", {
        message: "Không xác định được nhà hàng người dùng.",
      });
    }
    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const roleFilter =
      req.query.role && req.query.role.trim() !== ""
        ? req.query.role.trim()
        : null;

    // Loại bỏ cả CUSTOMER và RESOWNER
    let queryCondition = {
      role: { $nin: ["CUSTOMER", "RESOWNER"] },
      restaurant: req.user.restaurant,
    };

    if (searchQuery) {
      queryCondition.$or = [
        { firstName: { $regex: new RegExp(searchQuery, "i") } },
        { lastName: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    // ❌ Fix lỗi: Khi tạo nhân viên xong, không áp dụng lọc role mặc định
    if (roleFilter !== null) {
      queryCondition.role = roleFilter;
    }

    const staffs = await User.find(queryCondition);

    // Ánh xạ role sang tiếng Việt
    const roleMap = {
      WAITER: "Nhân viên phục vụ",
      KITCHENSTAFF: "Nhân viên phụ bếp",
      RESMANAGER: "Quản lý nhà hàng",
    };

    const staffsWithVietnameseRoles = staffs.map((staff) => {
      return {
        ...staff._doc, // Lấy toàn bộ dữ liệu của staff
        role: roleMap[staff.role] || staff.role, // Thay thế role bằng tiếng Việt, nếu không có trong map thì giữ nguyên
      };
    });

    return res.render("viewStaffInformation", {
      layout: "layouts/mainAdmin",
      title: "Danh sách nhân viên",
      staffs: staffsWithVietnameseRoles, // Sử dụng danh sách đã được ánh xạ
      searchQuery: searchQuery || "",
      selectedRole: roleFilter !== null ? roleFilter : "", // ✅ Đảm bảo `selectedRole` rỗng nếu không chọn gì
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách nhân viên:", error);
    return res.render("errorpage", {
      message: "Lỗi hệ thống, vui lòng thử lại",
      searchQuery: "",
      selectedRole: "",
    });
  }
};

exports.getStaffDetail = async (req, res) => {
  const { userId } = req.params;
  try {
    // Tìm nhân viên theo userId
    const staff = await User.findById({
      _id: userId,
      restaurant: req.user.restaurant,
    });
    if (!staff) {
      console.log("❌ Nhân viên không tồn tại:", userId);
      return res.render("errorpage", { message: "Nhân viên không tồn tại" });
    }

    // Tìm thông tin salary từ StaffInfor
    const staffDetails = await StaffInfor.findOne({ staff: userId });

    // Kiểm tra nếu nhân viên có `createdAt`, format lại ngày, nếu không thì trả về "Không có dữ liệu"
    const createdAt = staff.createdAt
      ? new Date(staff.createdAt).toLocaleDateString("vi-VN")
      : "Không có dữ liệu";

    // Ánh xạ role sang tiếng Việt
    const roleMap = {
      WAITER: "Nhân viên phục vụ",
      KITCHENSTAFF: "Nhân viên phụ bếp",
      RESMANAGER: "Quản lý nhà hàng",
    };

    const staffWithVietnameseRole = {
      ...staff._doc,
      role: roleMap[staff.role] || staff.role,
    };

    console.log("✅ Nhân viên tìm thấy:", staff);
    console.log("✅ createdAt:", createdAt);

    return res.render("viewDetailStaff", {
      layout: "layouts/mainAdmin",
      title: "Chi tiết nhân viên",
      staff: staffWithVietnameseRole, // Sử dụng staff đã được ánh xạ role
      salary: staffDetails ? staffDetails.salary : "Chưa cập nhật",
      createdAt, // ✅ Đảm bảo truyền `createdAt` vào EJS
    });
  } catch (error) {
    console.error("❌ Lỗi trong getStaffDetail:", error);
    return res.render("errorpage", {
      message: "Lỗi hệ thống, vui lòng thử lại",
    });
  }
};

exports.updateStaff = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, phoneNumber, role, salary, rate } =
    req.body;

  try {
    // Tìm nhân viên theo userId
    const staff = await User.findOne({
      _id: userId,
      restaurant: req.user.restaurant,
    });

    if (!staff) {
      return res.render("errorpage", { message: "Nhân viên không tồn tại" });
    }

    // Kiểm tra nếu email mới đã tồn tại ở nhân viên khác trong cùng nhà hàng
    const emailConflict = await User.findOne({
      email,
      restaurant: req.user.restaurant,
      _id: { $ne: userId },
    });

    if (emailConflict) {
      return res.render("updateInfoStaff", {
        layout: "layouts/mainAdmin",
        title: "Cập nhật thông tin nhân viên",
        staff,
        salary:
          (await StaffInfor.findOne({ staff: userId }))?.salary ||
          "Chưa cập nhật",
        errorMessage:
          "Email này đã được dùng bởi nhân viên khác trong nhà hàng",
      });
    }

    // Cập nhật thông tin nhân viên
    staff.firstName = firstName;
    staff.lastName = lastName;
    staff.email = email;
    staff.phoneNumber = phoneNumber;
    staff.role = role;
    await staff.save();

    // Lấy thông tin salary và rate trong StaffInfor
    let staffDetails = await StaffInfor.findOne({ staff: userId });
    if (!staffDetails) {
      staffDetails = new StaffInfor({ staff: userId, salary, rate: rate || 0 }); // Mặc định rate = 0 nếu không nhập
    } else {
      staffDetails.salary = salary;
      staffDetails.rate = rate || staffDetails.rate; // Nếu rate không nhập, giữ nguyên giá trị cũ
    }

    await staffDetails.save();

    // ✅ Truyền `createdAt` để tránh lỗi
    const createdAt = staff.createdAt
      ? new Date(staff.createdAt).toLocaleDateString("vi-VN")
      : "Không có dữ liệu";

    return res.render("viewDetailStaff", {
      layout: "layouts/mainAdmin",
      title: "Chi tiết nhân viên",
      staff,
      salary: staffDetails.salary,
      createdAt, // ✅ Truyền `createdAt` vào template
      successMessage: "Cập nhật thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật nhân viên:", error);
    return res.render("errorpage", {
      message: "Lỗi hệ thống, vui lòng thử lại",
    });
  }
};

exports.create = async (req, res) => {
  res.render("createStaff", {
    layout: "layouts/mainAdmin",
    title: "Create Staff",
  });
};

exports.update = async (req, res) => {
  const { userId } = req.params;

  try {
    // Tìm nhân viên theo userId
    const staff = await User.findOne({
      _id: userId,
      restaurant: req.user.restaurant,
    });
    if (!staff) {
      console.log("❌ Nhân viên không tồn tại:", userId);
      return res.render("errorpage", { message: "Nhân viên không tồn tại" });
    }

    // Lấy thông tin salary từ StaffInfor
    const staffDetails = await StaffInfor.findOne({ staff: userId });

    console.log("✅ Nhân viên tìm thấy:", staff);
    console.log("✅ staffDetails:", staffDetails);

    return res.render("updateInfoStaff", {
      layout: "layouts/mainAdmin",
      title: "Cập nhật thông tin nhân viên",
      staff, // ✅ Truyền staff vào EJS
      salary: staffDetails ? staffDetails.salary : "Chưa cập nhật",
    });
  } catch (error) {
    console.error("❌ Lỗi khi tải form cập nhật nhân viên:", error);
    return res.render("errorpage", {
      message: "Lỗi hệ thống, vui lòng thử lại",
    });
  }
};

exports.createStaff = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    confirmPassword,
    salary,
    role,
  } = req.body;

  try {
    // 1️⃣ Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({
      email,
      restaurant: req.user.restaurant,
    });
    if (existingUser) {
      return res.render("createStaff", {
        layout: "layouts/mainAdmin",
        title: "Create Staff",
        errorMessage: "Tài khoản đã tồn tại",
        successMessage: null,
      });
    }

    // 2️⃣ Kiểm tra mật khẩu có khớp không
    // if (password !== confirmPassword) {
    //     return res.render("createStaff", {
    //         layout: "layouts/mainAdmin",
    //         title: "Create Staff",
    //         errorMessage: "Mật khẩu xác nhận không khớp",
    //         successMessage: null,
    //     });
    // }

    // 3️⃣ Mã hóa mật khẩu
    // 3️⃣ Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4️⃣ Kiểm tra và gán role hợp lệ
    const validRoles = ["WAITER", "KITCHENSTAFF", "RESMANAGER"];
    const selectedRole = validRoles.includes(role) ? role : "WAITER"; // Đã sửa lỗi cú pháp

    // 5️⃣ Tạo tài khoản nhân viên
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber: phone,
      role: selectedRole,
      status: "ACTIVE",
      restaurant: req.user.restaurant,
    });

    // 6️⃣ Lưu nhân viên vào database
    await newUser.save();

    // 7️⃣ Thêm mức lương vào `StaffInfor`
    const newStaffInfor = new StaffInfor({
      staff: newUser._id,
      salary: salary,
      rate: 0, // Mặc định rate là 0
    });

    await newStaffInfor.save();

    // 8️⃣ Gửi email kích hoạt tài khoản (nếu cần)
    try {
      const resetToken = await genarateResetToken();
      newUser.resetToken = resetToken;
      newUser.resetTokenExpiration = Date.now() + 3600000;
      await sendMail(req.body.email, resetToken, true);
      await newUser.save();
    } catch (err) {
      console.error("Lỗi gửi email:", err);
    }

    // 9️⃣ Load lại danh sách toàn bộ nhân viên sau khi tạo
    return res.redirect("/admin/staffs?role="); // ✅ Reset bộ lọc role để hiển thị tất cả nhân viên
  } catch (error) {
    console.error("❌ Lỗi khi tạo nhân viên:", error);
    return res.render("createStaff", {
      layout: "layouts/mainAdmin",
      title: "Create Staff",
      errorMessage: "Có lỗi xảy ra, vui lòng thử lại",
      successMessage: null,
    });
  }
};

exports.lockStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      _id: id,
      restaurant: req.user.restaurant,
    });
    if (!user) {
      return res.render("errorpage", { message: "Nhân viên không tồn tại" });
    }

    user.status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await user.save();

    return res.redirect("/admin/staffs");
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái nhân viên:", error);
    return res.render("errorpage", {
      message: "Lỗi hệ thống, vui lòng thử lại",
    });
  }
};
