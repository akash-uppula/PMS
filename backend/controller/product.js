import Product from "../model/product.js";

export const addProduct = async (req, res) => {
  try {
    const { name, price, stock, categoryId, description, maxDiscount } = req.body;

    const roundedPrice = Math.round(Number(price) * 100) / 100;
    const discount = Number(maxDiscount) || 0;
    const initialStock = Number(stock) || 0;

    if (discount < 0 || discount > 100) {
      return res.status(400).json({ message: "maxDiscount must be between 0 and 100" });
    }

    const product = new Product({
      name,
      price: roundedPrice,
      stock: initialStock,
      totalStock: initialStock,
      category: categoryId,
      description,
      maxDiscount: discount,
      image: req.file ? req.file.filename : null,
      createdBy: req.user._id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id })
      .populate("category")
      .populate("createdBy", "firstName lastName email")
      .sort({ name: 1 });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params._id,
      createdBy: req.user._id,
    })
      .populate("category")
      .populate("createdBy", "firstName lastName email");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, categoryId, description, maxDiscount } = req.body;

    const updatedFields = { name, category: categoryId, description };

    if (price !== undefined) updatedFields.price = Math.round(Number(price) * 100) / 100;

    if (maxDiscount !== undefined) {
      const discount = Number(maxDiscount);
      if (discount < 0 || discount > 100)
        return res.status(400).json({ message: "maxDiscount must be between 0 and 100" });
      updatedFields.maxDiscount = discount;
    }

    if (req.file) updatedFields.image = req.file.filename;

    const product = await Product.findOneAndUpdate(
      { _id: req.params._id, createdBy: req.user._id },
      updatedFields,
      { new: true }
    )
      .populate("category")
      .populate("createdBy", "firstName lastName email");

    if (!product)
      return res.status(404).json({ message: "Product not found or not authorized" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params._id,
      createdBy: req.user._id,
    });

    if (!product) return res.status(404).json({ message: "Product not found or not authorized" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};

export const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);

    const product = await Product.findOneAndUpdate(
      { _id: req.params._id, createdBy: req.user._id },
      { $inc: { stock: qty, totalStock: qty } },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to add stock", error: err.message });
  }
};

export const removeStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);

    const product = await Product.findOne({ _id: req.params._id, createdBy: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const removeQty = Math.min(qty, product.stock);
    product.stock -= removeQty;
    product.totalStock -= removeQty;
    await product.save();

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove stock", error: err.message });
  }
};
