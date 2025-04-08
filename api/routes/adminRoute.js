import express from 'express'
import { adminLogin,dashboard,deleteUser,userData,editUserData,addUser,signOut } from '../controllers/adminController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router=express.Router()


router.post('/adminLogin',adminLogin)
router.get('/dashboard',dashboard)
router.delete('/deleteUser/:id',deleteUser)
router.get('/editUser/:id',userData)
router.post('/editUser/:id',editUserData)
router.post('/addUser',addUser)
router.get('/signout',signOut)


export default router;