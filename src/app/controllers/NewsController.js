const News = require('../models/News');

exports.getNews = async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.render('news', { news });
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).send("Lỗi khi lấy dữ liệu tin tức");
    }
};

// Lấy chi tiết bài viết
exports.getNewsInfor = async (req, res) => {
    try {
        const article = await News.findById(req.params.id);
        if (!article) {
            return res.status(404).send("Bài viết không tồn tại");
        }

        // Tìm các bài viết liên quan
        const relatedNews = await News.find({ _id: { $ne: req.params.id } }).limit(3);

        res.render('newsInfor', { article, relatedNews });
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).send("Lỗi khi lấy dữ liệu bài viết");
    }
};
