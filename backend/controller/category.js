import Category from "../model/category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({
      name,
      createdBy: req.user._id,
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name,
      description,
      createdBy: req.user._id,
    });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ createdBy: req.user._id }).sort({
      name: 1,
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: req.params._id, createdBy: req.user._id },
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found or not yours" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params._id,
      createdBy: req.user._id,
    });

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found or not yours" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
