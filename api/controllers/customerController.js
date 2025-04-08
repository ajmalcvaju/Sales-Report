import Customer from '../models/customer.js';
import { errorHandler } from '../utils/error.js';

// Create a new customer
export const createCustomer = async (req, res, next) => {
  try {
    console.log("hello",req.body);
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    next(err);
  }
};

// Get all customers
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (err) {
    next(err);
  }
};

// Update a customer by ID
export const updateCustomer = async (req, res, next) => {
  try {
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return next(errorHandler(404, 'Customer not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete a customer by ID
export const deleteCustomer = async (req, res, next) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return next(errorHandler(404, 'Customer not found'));
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
};
