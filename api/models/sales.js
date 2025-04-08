import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const saleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String, // or use `Date` if you want to store it as a native Date
    required: true,
  },
  items: {
    type: [saleItemSchema],
    required: true,
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
});

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
