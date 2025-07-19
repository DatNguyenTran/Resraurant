const express = require("express");
const router = express.Router();
const newsController = require("../app/controllers/NewsController");

router.get("/", newsController.getNews);
router.get("/:id", newsController.getNewsInfor);

module.exports = router;
