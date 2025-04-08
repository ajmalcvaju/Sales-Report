import express from 'express'
import { createProduct, getProduct, updateProduct, deleteProduct, saleProduct, getSales} from '../controllers/productController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router=express.Router()

router.post("/create",createProduct)
router.get("/",getProduct)
router.get("/sales",getSales)
router.post("/update/:id",updateProduct)
router.delete("/delete/:id",deleteProduct)
router.patch("/sale",saleProduct)

export default router;