import express from 'express';
import {
  purchaseProduct,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  saleProduct,
  getSales,
  getPurchase,
  sendSalesReport
} from '../controllers/productController.js';
import { uploads } from '../middlewares/email.js';

const router = express.Router();

router.route('/')
  .get(getProduct);

router.route('/create-product')
  .post(createProduct);

router.route('/sales')
  .get(getSales);

router.route('/purchase')
  .get(getPurchase)
  .patch(purchaseProduct);

router.route('/sale')
  .patch(saleProduct);

router.route('/update-product/:id')
  .patch(updateProduct);

router.route('/delete-product/:id')
  .delete(deleteProduct);

router.route('/send-report')
  .post(uploads,sendSalesReport);

export default router;
