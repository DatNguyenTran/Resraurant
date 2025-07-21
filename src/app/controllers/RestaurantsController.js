const RestaurantInfor = require("../models/RestaurantInfor");
const moment = require("moment");
class RestaurantsController {
  async getAll(req, res, next) {
    try {
      const restaurantInfo = await RestaurantInfor.findOne();

      if (restaurantInfo) {
        restaurantInfo.openingHours = moment(
          restaurantInfo.openingHours
        ).format("HH:mm");
        restaurantInfo.closingHours = moment(
          restaurantInfo.closingHours
        ).format("HH:mm");
      }
      res.locals.footerData = restaurantInfo || {
        address: "Địa chỉ chưa cập nhật",
        phone: "Chưa có số điện thoại",
      };
      next();
    } catch (error) {
      next(error);
    }
  }

  async getInformationRes(req, res, next) {
    try {
      const restaurantInfo = await RestaurantInfor.findOne();

      if (restaurantInfo) {
        restaurantInfo.openingHours = moment(
          restaurantInfo.openingHours
        ).format("HH:mm");
        restaurantInfo.closingHours = moment(
          restaurantInfo.closingHours
        ).format("HH:mm");
      }
      res.render("settingInformation", {
        layout: "layouts/mainAdmin",
        restaurantInfo: restaurantInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  updateRestaurant = async (req, res, next) => {
    try {
      const {
        restaurantName,
        address,
        openingHours,
        closingHours,
        hotline,
        email,
        bannerUrl,
      } = req.body;

      // Chuyển đổi 'HH:mm' thành một đối tượng Date hợp lệ (sử dụng ngày hôm nay)
      const convertToDate = (timeStr) => {
        if (!timeStr) return null; // Nếu không có dữ liệu, trả về null
        const [hours, minutes] = timeStr.split(":").map(Number);
        const now = new Date();
        now.setHours(hours, minutes, 0, 0); // Đặt giờ, phút và reset giây, mili-giây
        return now;
      };

      const openingHoursDate = convertToDate(openingHours);
      const closingHoursDate = convertToDate(closingHours);

      // Kiểm tra nếu giờ đóng cửa nhỏ hơn giờ mở cửa
      if (
        closingHoursDate &&
        openingHoursDate &&
        closingHoursDate <= openingHoursDate
      ) {
        req.flash("error", "Giờ đóng cửa phải lớn hơn giờ mở cửa.");
        return res.redirect("/restaurantInfor/settingInformation");
      }

      await RestaurantInfor.findOneAndUpdate(
        {},
        {
          restaurantName,
          address,
          openingHours: openingHoursDate,
          closingHours: closingHoursDate,
          hotline,
          email,
          bannerUrl,
        }
      );

      res.redirect("/restaurantInfor/managers"); // Reload lại trang sau khi cập nhật
    } catch (error) {
      next(error);
    }
  };

  async create(req, res, next) {
    try {
      const restaurantInfo = new RestaurantInfor(req.body);
      await restaurantInfo.save();
      res.json(restaurantInfo);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }
}

const restaurantsController = new RestaurantsController();

module.exports = restaurantsController;

module.exports.getFooterData = restaurantsController.getAll;
