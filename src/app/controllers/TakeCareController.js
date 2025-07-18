const TakeCare = require('../models/TakeCare');
const User = require('../models/User');

exports.renderCreateTakeCare = async (req, res) => {
    try {
        const staffs = await User.find({
            role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] },
            restaurant: req.user.restaurant  
        });
        
        res.render('createTakeCare', { 
            layout: "layouts/mainAdmin",
            title: "Tạo lịch làm",
            staffs,
            errorMessage: null 
        });
    } catch (error) {
        console.error("Lỗi khi tải form tạo TakeCare:", error);
        res.status(500).send("Lỗi khi tải form tạo TakeCare");
    }
};

exports.createTakeCare = async (req, res) => {
    try {
        let { staffId, date, startTime, endTime } = req.body;


        if (!staffId || !date || !startTime || !endTime) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] },  restaurant: req.user.restaurant }),
                errorMessage: "Vui lòng điền đầy đủ thông tin (nhân viên, ngày, giờ bắt đầu, giờ kết thúc)."
            });
        }

        const staffMember = await User.findOne({ _id: staffId, restaurant: req.user.restaurant });
        if (!staffMember || !["WAITER", "KITCHENSTAFF", "RESMANAGER"].includes(staffMember.role)) {
            return res.render('createTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Tạo TakeCare",
                staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] }, restaurant: req.user.restaurant }),
                errorMessage: "Nhân viên không hợp lệ hoặc không thuộc vai trò WAITER, KITCHENSTAFF, hoặc RESMANAGER."
            });
        }
        
        const newTakeCare = new TakeCare({
            staff: staffMember._id,
            date,
            startTime,
            endTime,
        });

        await newTakeCare.save();
        return res.redirect('/admin/takeCare');
    } catch (error) {
        console.error("Lỗi khi tạo TakeCare:", error);
        return res.render('createTakeCare', {
            layout: "layouts/mainAdmin",
            title: "Tạo TakeCare",
            staffs: await User.find({ role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] } }),
            errorMessage: "Lỗi máy chủ. Vui lòng thử lại sau."
        });
    }
};

exports.getTakeCares = async (req, res) => {
    try {
        const takeCares = (await TakeCare.find().populate({
            path: 'staff',
            match: { restaurant: req.user.restaurant }
        })).filter(tc => tc.staff);
 
        takeCares.forEach(tc => {
            console.log(`ID: ${tc._id}, Nhân viên: ${tc.staff ? tc.staff.firstName + " " + tc.staff.lastName : "Không có nhân viên"}`);
        });

        res.render('viewTakeCare', { 
            layout: "layouts/mainAdmin", 
            title: "Danh sách lịch làm",
            takeCares
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách TakeCare:", error);
        res.status(500).send("Lỗi khi lấy danh sách TakeCare.");
    }
};

exports.renderUpdateTakeCare = async (req, res) => {
    try {
        const { id } = req.params;

        const takeCare = await TakeCare.findById(id)
            .populate('staff'); 

        if (!takeCare || String(takeCare.staff?.restaurant) !== String(req.user.restaurant)) {
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại hoặc không thuộc nhà hàng của bạn.",
                layout: "layouts/mainAdmin",
            });
        }

        const staffs = await User.find({
            role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] },
            restaurant: req.user.restaurant
        });
        
        res.render('updateTakeCare', { 
            layout: "layouts/mainAdmin",
            title: "Chỉnh sửa lịch làm",
            takeCare,
            staffs,
            errorMessage: null 
        });
    } catch (error) {
        console.error("Lỗi khi tải form chỉnh sửa TakeCare:", error);
        res.status(500).send("Lỗi khi tải form chỉnh sửa TakeCare.");
    }
};



exports.updateTakeCare = async (req, res) => {
    try {
        const { id } = req.params;
        let { staffId, date, startTime, endTime } = req.body;

        const takeCare = await TakeCare.findById(id).populate('staff');
        if (!takeCare || String(takeCare.staff?.restaurant) !== String(req.user.restaurant)) {
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại hoặc không thuộc nhà hàng của bạn.",
                layout: "layouts/mainAdmin",
            });
        }
        
        if (!staffId || !date || !startTime || !endTime) {
            const staffs = await User.find({
                role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] },
                restaurant: req.user.restaurant
            });
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                errorMessage: "Vui lòng điền đầy đủ thông tin (ngày, giờ bắt đầu, giờ kết thúc, nhân viên)."
            });
        }
       
        const staffMember = await User.findOne({
            _id: staffId,
            restaurant: req.user.restaurant
        });

        if (!staffMember || !["WAITER", "KITCHENSTAFF", "RESMANAGER"].includes(staffMember.role)) {
            const staffs = await User.find({
                role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] },
                restaurant: req.user.restaurant
            });
            return res.render('updateTakeCare', {
                layout: "layouts/mainAdmin",
                title: "Chỉnh sửa lịch làm",
                takeCare,
                staffs,
                errorMessage: "Nhân viên không hợp lệ hoặc không thuộc vai trò WAITER, KITCHENSTAFF, hoặc RESMANAGER."
            });
        }
        
        const updatedTakeCare = await TakeCare.findByIdAndUpdate(
            id,
            {
                staff: staffMember._id,
                date,
                startTime,
                endTime,
            },
            { new: true } 
        );

        if (!updatedTakeCare) {
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại.",
                layout: "layouts/mainAdmin",
            });
        }

        return res.redirect('/admin/takeCare');
    } catch (error) {
        console.error("Lỗi khi cập nhật TakeCare:", error);
        const takeCare = await TakeCare.findById(id).populate('staff');
        const staffs = await User.find({
            role: { $in: ["WAITER", "KITCHENSTAFF", "RESMANAGER"] },
            restaurant: req.user.restaurant
        });
        
        return res.render('updateTakeCare', {
            layout: "layouts/mainAdmin",
            title: "Chỉnh sửa lịch làm",
            takeCare,
            staffs,
            errorMessage: "Lỗi máy chủ. Vui lòng thử lại sau."
        });
    }
};



exports.deleteTakeCare = async (req, res) => {
    try {
        const { id } = req.params;
        const takeCare = await TakeCare.findById(id).populate('staff');

        if (!takeCare || String(takeCare.staff?.restaurant) !== String(req.user.restaurant)) {
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại hoặc không thuộc nhà hàng của bạn.",
                layout: "layouts/mainAdmin",
            });
        }

        await TakeCare.findByIdAndDelete(id);
        console.log(`Xóa thành công lịch làm với ID: ${id}`);

        return res.redirect("/admin/takeCare");
    } catch (error) {
        console.error("Lỗi khi xóa lịch làm:", error);
        return res.render("errorpage", {
            message: "Lỗi máy chủ, không thể xóa lịch làm.",
            layout: "layouts/mainAdmin",
        });
    }
};

exports.getStaffSchedule = async (req, res) => {
    try {
        const { userId } = req.params; 

        const staff = await User.findOne({ _id: userId, restaurant: req.user.restaurant });
        if (!staff) {
            console.log("Nhân viên không tồn tại:", userId);
            return res.render("errorpage", {
                message: "Nhân viên không tồn tại",
                layout: "layouts/mainAdmin",
            });
        }

        const takeCares = await TakeCare.find({ staff: userId })
            .populate('staff'); 
       
        console.log(`Lấy thành công lịch làm của nhân viên: ${staff.firstName} ${staff.lastName}`);
        takeCares.forEach(tc => {
            console.log(`ID: ${tc._id}, Ngày: ${tc.date}, Thời gian: ${tc.startTime} - ${tc.endTime}`);
        });

        res.render('viewStaffSchedule', {
            layout: "layouts/mainAdmin",
            title: "Lịch làm của nhân viên",
            takeCares,
            staff 
        });
    } catch (error) {
        console.error("Lỗi khi lấy lịch làm của nhân viên:", error);
        return res.render("errorpage", {
            message: "Lỗi hệ thống, vui lòng thử lại",
            layout: "layouts/mainAdmin",
        });
    }
};

exports.renderDetailTakeCare = async (req, res) => {
    try {
        const { id } = req.params;

        const takeCare = await TakeCare.findById(id).populate('staff');

        if (!takeCare || String(takeCare.staff?.restaurant) !== String(req.user.restaurant)) {
            return res.render("errorpage", {
                message: "Lịch làm không tồn tại hoặc không thuộc nhà hàng của bạn.",
                layout: "layouts/mainAdmin",
            });
        }

        res.render('detailTakeCare', { 
            layout: "layouts/mainAdmin",
            title: "Chi tiết lịch làm",
            takeCare
        });
    } catch (error) {
        console.error("Lỗi khi tải trang chi tiết TakeCare:", error);
        res.status(500).send("Lỗi khi tải trang chi tiết TakeCare.");
    }
};


