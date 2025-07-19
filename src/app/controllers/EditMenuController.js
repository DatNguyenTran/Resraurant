const Menu = require('../models/Menu');

const stream = require("stream");
const cloudinary = require('../../config/cloudinary/index')

exports.getList = async (req, res) => {
  try {
    const menus = await Menu.find({ restaurant: req.user.restaurant })
    res.render('editMenu', { menus, layout: 'layouts/mainAdmin' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.renderDetailDish = async (req, res) => {
  try {
    const dish = await Menu.findOne({ _id: req.params.id, restaurant: req.user.restaurant })
    if (!dish) {
      return res.status(404).send("Món ăn không tồn tại");
    }
    res.render("detailDish", { dish, layout: "layouts/mainAdmin" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};


exports.deleteDish = async (req, res) => {
  try {
    const dishId = req.params.id;
    const deletedDish = await Menu.findOneAndDelete({
      _id: dishId,
      restaurant: req.user.restaurant,
    });
    if (!deletedDish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    res.status(200).json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.renderCreateForm = async (req, res) => {
  try {
    res.render('createDish', { layout: 'layouts/mainAdmin' });
  } catch (err) {
    res.status(500).send(err.message);
  }
};


exports.createDish = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có ảnh nào được tải lên." });
      }

       // Tạo stream upload ảnh lên Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "dishes", // Lưu ảnh vào folder 'dishes'
        public_id: `dish_${Date.now()}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error("Lỗi khi tải ảnh món ăn lên Cloudinary:", error);
          return res.status(500).json({ message: "Lỗi khi tải ảnh lên Cloudinary" });
        }
        
        // Lấy URL ảnh trả về từ Cloudinary
        const dishImageUrl = result.secure_url;
        console.log("Ảnh món ăn:", dishImageUrl);

        const restaurantId = req.user.restaurant;

        // Tạo món ăn mới với URL ảnh từ Cloudinary
        const newDish = new Menu({
          foodName: req.body.foodName,
          description: req.body.description,
          price: req.body.price,
          imageUrl: dishImageUrl,
          statusFood: "AVAILABLE",
          restaurant: restaurantId, 
        });

        newDish.save()
          .then(dish => {
            res.json({ success: true, message: "Tải ảnh món ăn thành công!", dish });
          })
          .catch(err => {
            console.error("Lỗi khi lưu món ăn:", err);
            res.status(500).json({ message: "Lỗi khi lưu món ăn." });
          });
      }
    );

    // Chuyển buffer từ multer thành stream và pipe lên Cloudinary
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    console.error("Lỗi khi tải ảnh món ăn:", error);
    res.status(500).json({ message: "Lỗi khi tải ảnh món ăn." });
  }
};

exports.renderEditForm = async (req, res) => {
  try {
    const dish = await Menu.findOne({ _id: req.params.id, restaurant: req.user.restaurant });
    if (!dish) return res.status(404).send('Dish not found');
    res.render('editDish', { dish, layout: 'layouts/mainAdmin' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateDish = async (req, res) => {
  try {
    const dishId = req.params.id;
    const restaurantId = req.user.restaurant;
    // Chuẩn bị dữ liệu cập nhật từ form
    let updateData = {
      foodName: req.body.foodName,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl 
    };

    // Nếu có file mới được tải lên, sử dụng stream để upload lên Cloudinary
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "dishes", // Lưu ảnh vào folder 'dishes'
          public_id: `dish_${Date.now()}`,
          overwrite: true,
        },
        async (error, result) => {
          if (error) {
            console.error("Lỗi khi tải ảnh món ăn lên Cloudinary:", error);
            return res.status(500).json({ message: "Lỗi khi tải ảnh lên Cloudinary" });
          }
          // Lấy URL mới từ Cloudinary
          updateData.imageUrl = result.secure_url;
          // Cập nhật món ăn với dữ liệu mới
          const updatedDish = await Menu.findByIdAndUpdate({ _id: dishId, restaurant: restaurantId }, updateData, { new: true });
          if (!updatedDish) {
            return res.status(404).json({ success: false, message: "Món ăn không tồn tại!" });
          }
          return res.status(200).json({ success: true, message: "Cập nhật món ăn thành công!", dish: updatedDish });
        }
      );

      // Chuyển buffer từ multer (memoryStorage) thành stream và pipe lên Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } else {
      // Nếu không có file mới, cập nhật trực tiếp với updateData (bao gồm imageUrl cũ từ form)
      const updatedDish = await Menu.findByIdAndUpdate({ _id: dishId, restaurant: restaurantId }, updateData, { new: true });
      if (!updatedDish) {
        return res.status(404).json({ success: false, message: "Món ăn không tồn tại!" });
      }
      return res.status(200).json({ success: true, message: "Cập nhật món ăn thành công!", dish: updatedDish });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật món ăn:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
