const News = require('../models/News');
const stream = require("stream");
const cloudinary = require('../../config/cloudinary/index');

exports.getList = async (req, res) => {
  try {
    const newsList = await News.find();
    res.render('adminNews', { newsList, layout: 'layouts/mainAdmin' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.renderDetailNews = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).send("Bài viết không tồn tại");
    }
    res.render("detailNews", { article, layout: "layouts/mainAdmin" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const deletedNews = await News.findByIdAndDelete(newsId);
    if (!deletedNews) {
      return res.status(404).json({ error: 'Bài viết không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa bài viết thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.renderCreateForm = (req, res) => {
  res.render('createNews', { layout: 'layouts/mainAdmin' });
};

exports.createNews = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có ảnh nào được tải lên." });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "news",
        public_id: `news_${Date.now()}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error("Lỗi khi tải ảnh bài viết lên Cloudinary:", error);
          return res.status(500).json({ message: "Lỗi khi tải ảnh lên Cloudinary" });
        }

        const newsImageUrl = result.secure_url;
        console.log("Ảnh bài viết:", newsImageUrl);

        const newArticle = new News({
          title: req.body.title,
          content: req.body.content,
          image: newsImageUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        newArticle.save()
          .then(article => {
            res.json({ success: true, message: "Tạo bài viết thành công!", article });
          })
          .catch(err => {
            console.error("Lỗi khi lưu bài viết:", err);
            res.status(500).json({ message: "Lỗi khi lưu bài viết." });
          });
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    console.error("Lỗi khi tạo bài viết:", error);
    res.status(500).json({ message: "Lỗi khi tạo bài viết." });
  }
};

exports.renderEditForm = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) {
      return res.status(404).send('Bài viết không tồn tại');
    }
    res.render('editNews', { article, layout: 'layouts/mainAdmin' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    let updateData = {
      title: req.body.title,
      content: req.body.content,
      updatedAt: new Date()
    };

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "news",
          public_id: `news_${Date.now()}`,
          overwrite: true,
        },
        async (error, result) => {
          if (error) {
            console.error("Lỗi khi tải ảnh bài viết lên Cloudinary:", error);
            return res.status(500).json({ message: "Lỗi khi tải ảnh lên Cloudinary" });
          }
          updateData.image = result.secure_url;

          const updatedArticle = await News.findByIdAndUpdate(newsId, updateData, { new: true });
          if (!updatedArticle) {
            return res.status(404).json({ success: false, message: "Bài viết không tồn tại!" });
          }
          return res.status(200).json({ success: true, message: "Cập nhật bài viết thành công!", article: updatedArticle });
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } else {
      const updatedArticle = await News.findByIdAndUpdate(newsId, updateData, { new: true });
      if (!updatedArticle) {
        return res.status(404).json({ success: false, message: "Bài viết không tồn tại!" });
      }
      return res.status(200).json({ success: true, message: "Cập nhật bài viết thành công!", article: updatedArticle });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật bài viết:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchNews = async (req, res) => {
  try {
    const { q } = req.query;
    const articles = await News.find({
      title: { $regex: q, $options: 'i' }
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
