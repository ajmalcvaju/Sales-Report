import Product from '../models/product.js';
import { errorHandler } from '../utils/error.js';
import Sale from '../models/sales.js';

// Create a new product
export const createProduct = async (req, res, next) => {
  try {
    console.log(req.body)
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    next(err);
  }
};

// Get all products
export const getProduct = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// Update a product by ID (requires auth)
export const updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return next(errorHandler(404, 'Product not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete a product by ID (requires auth)
export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return next(errorHandler(404, 'Product not found'));
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const saleProduct=async (req, res, next) => {
  try {
    console.log(req.body)
    const { userId, customerName, date, items } = req.body;

    if (!customerName || !date || !items || items.length === 0) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Save the sale
    const newSale = new Sale({ userId, customerName, date, items });
    await newSale.save();

    // Update product quantities
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return next(errorHandler(404, `Product not found: ${item.productId}`));
      }

      product.quantity = Math.max((product.quantity || 0) - item.quantity, 0); // optional safety check
      await product.save();
    }
    res.status(201).json({ message: "Sale recorded successfully", sale: newSale });
  } catch (err) {
    next(err);
  }
};

export const getSales=async (req, res, next) => {
  try {
    const sales = await Sale.find();
    console.log(sales)
    res.status(200).json(sales);
  } catch (err) {
    next(err);
  }
};
