import express from 'express'
import { signin } from '../controllers/authController.js';


const router=express.Router()

router.post("/login",signin)


export default router;