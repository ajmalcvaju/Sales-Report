import express from 'express'
import { createCustomer, getCustomers, updateCustomer, deleteCustomer} from '../controllers/customerController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router=express.Router()

router.post("/create",createCustomer)
router.get("/",getCustomers)
router.post("/update/:id",updateCustomer)
router.delete("/delete/:id",deleteCustomer)

export default router;