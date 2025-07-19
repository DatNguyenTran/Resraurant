const Menu = require('../models/Menu');
const CategoryFood = require('../models/CategoryFood');

exports.getMenu = async (req, res) => {
  try {
    const menus = await Menu.find().populate('category');
    const categories = await CategoryFood.find();

    const categoryCounts = {};
    categories.forEach(cat => {
      categoryCounts[cat.categoryName] = menus.filter(menu => menu.category?.categoryName === cat.categoryName).length;
    });

    const totalCount = menus.length;

    res.render('menu', {
      menus,
      categories,
      categoryCounts,
      totalCount,
      layout: 'layouts/main' // hoặc layout bạn dùng
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
