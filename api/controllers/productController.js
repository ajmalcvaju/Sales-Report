import Product from '../models/product.js';
import { errorHandler } from '../utils/error.js';
import Sale from '../models/sales.js';
import Purchase from '../models/purchase.js';
import StatusCodes from '../utils/constants.js';
import nodemailer from "nodemailer";

// Create a new product
export const createProduct = async (req, res, next) => {
  try {
    console.log(req.body)
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(StatusCodes.OK).json(savedProduct);
  } catch (err) {
    next(err);
  }
};

// Get all products
export const getProduct = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(StatusCodes.OK).json(products);
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
    if (!updated) return next(errorHandler(StatusCodes.NOT_FOUND, 'Product not found'));
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete a product by ID (requires auth)
export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return next(errorHandler(StatusCodes.NOT_FOUND, 'Product not found'));
    res.status(StatusCodes.OK).json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const saleProduct=async (req, res, next) => {
  try {
    console.log(req.body)
    const { userId, customerName, date, items } = req.body;

    if (!customerName || !date || !items || items.length === 0) {
      return next(errorHandler(StatusCodes.BAD_REQUEST, "All fields are required"));
    }

    // Save the sale
    const newSale = new Sale({ userId, customerName, date, items });
    await newSale.save();

    // Update product quantities
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return next(errorHandler(StatusCodes.NOT_FOUND, `Product not found: ${item.productId}`));
      }
      product.quantity = Math.max((product.quantity || 0) - item.quantity, 0); // optional safety check
      await product.save();
    }
    res.status(StatusCodes.OK).json({ message: "Sale recorded successfully", sale: newSale });
  } catch (err) {
    next(err);
  }
};

export const getSales=async (req, res, next) => {
  try {
    const sales = await Sale.find();
    console.log(sales)
    res.status(StatusCodes.OK).json(sales);
  } catch (err) {
    next(err);
  }
};

export const getPurchase=async (req, res, next) => {
  try {
    const purchase = await Purchase.find();
    res.status(StatusCodes.OK).json(purchase);
  } catch (err) {
    next(err);
  }
};

export const purchaseProduct=async (req, res, next) => {
  try {
console.log(req.body)
    const { userId, customerName, date, items } = req.body;
    if (!customerName || !date || !items || items.length === 0) {
      return next(errorHandler(StatusCodes.BAD_REQUEST, "All fields are required"));
    }    
    const newPurchase = new Purchase({ userId, customerName, date, items });
    await newPurchase.save();
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(errorHandler(StatusCodes.NOT_FOUND, `Product not found: ${item.productId}`));
      }
      
      product.quantity = Math.max((product.quantity || 0) + item.quantity, 0);
      await product.save();
    }
    res.status(StatusCodes.OK).json({ message: "Purchase recorded successfully", sale: newPurchase });
  } catch (err) {
    next(err);
  }
};
export const sendSalesReport = async (req, res, next) => {
  try {
    const { pdf, excel } = req.files;
    const { email } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ajmalcvaju1997@gmail.com", // should match your gmail
        pass: "esedwiugvfofnmvr", // must be an App Password
      },
    });

    const mailOptions = {
      from: "ajmalcvaju97@gmail.com",
      to: email,
      subject: "Sales Report",
      text: "Attached are the sales reports in PDF and Excel formats.",
      attachments: [
        {
          filename: "sales_report.pdf",
          content: pdf[0].buffer,
        },
        {
          filename: "sales_report.xlsx",
          content: excel[0].buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    next(error);
  }
};
