import Customer from '../models/customer.js';
import { errorHandler } from '../utils/error.js';
import StatusCodes from '../utils/constants.js';

// Create a new customer
export const createCustomer = async (req, res, next) => {
  try {
    console.log("hello",req.body);
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(StatusCodes.OK).json(savedCustomer);
  } catch (err) {
    next(err);
  }
};

// Get all customers
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find();
    res.status(StatusCodes.OK).json(customers);
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
    if (!updated) return next(errorHandler(StatusCodes.NOT_FOUND, 'Customer not found'));
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete a customer by ID
export const deleteCustomer = async (req, res, next) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return next(errorHandler(StatusCodes.NOT_FOUND, 'Customer not found'));
    res.status(StatusCodes.OK).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
};
