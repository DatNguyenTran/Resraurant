const CategoryFood = require('../models/CategoryFood');

exports.get = async (req, res) => {
  try {
    const categories = await CategoryFood.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { categoryName, description, imageUrl } = req.body;
    const newCategory = new CategoryFood({ categoryName, description, imageUrl });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
