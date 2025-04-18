import express from 'express';
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = express.Router();

router.route('/')
  .get(getCustomers);

router.route('/create-customer')
  .post(createCustomer);

router.route('/update-customer/:id')
  .patch(updateCustomer);

router.route('/delete-customer/:id')
  .delete(deleteCustomer);

export default router;
