import jwt from 'jsonwebtoken';
import { errorHandler } from "../utils/error.js";
import User from '../models/user.js';
import bcryptjs from 'bcryptjs'

export const adminLogin = (req, res, next) => {
    console.log(process.env.USERNAME);
    const { username, password } = req.body;
    try {
        if (username === "ajmalcvaju" && password === "Ajmal12@") {
            const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const expiryDate = new Date(Date.now() + 3600000);
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
               .status(200)
               .json({ message: "Login successful", admin:username });
        } else {
            return next(errorHandler(404, "Wrong Credentials"));
        }
    } catch (error) {
        next(error); 
    }
};

export const dashboard = async (req, res, next) => {
    console.log("hi")
    try {
        const users = await User.find().sort({ _id: -1 });
        res.status(200).json(users);
    } catch (error) {
        next(error); 
    }
  };

  

  export const deleteUser= async (req, res, next) => {
    try {
        const deleteUser=await User.deleteOne({_id:req.params.id})
        console.group(deleteUser)
        res.status(200).json("User has been deleted....")
    } catch (error) {
        next(error)
    }
  };

  export const userData=async (req,res,next)=>{
    try {
        let id=req.params.id
        const user=await User.findOne({_id:id})
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
  }

  export const editUserData=async(req,res,next)=>{
    try {
        const {username,email}=req.body
        console.log(req.params.id)
        const id=req.params.id
        const editedUser=await User.findOneAndUpdate({_id:id},{$set:req.body})
        console.log(editedUser)
        res.status(200).json({success:true})
    } catch (error) {
        next(error)
    }
  }

  export const addUser=async(req,res,next)=>{
    try {
        const {username,email,password}=req.body
        const hashedPassword=bcryptjs.hashSync(password,10)
        const newUser=new User({username,email,password:hashedPassword})
       try {
        await newUser.save()
        res.status(201).json({message:"User Created successfully",success:true})
       } catch (error) {
         next(errorHandler(300,"something went wrong"))
       }
    } catch (error) {
        next(error)
    }
  }

  export const signOut=async(req,res,next)=>{
    try {
        res.clearCookie('access_token').status(200).json({message:'Signout success'})
    } catch (error) {
        next(error)
    }
  }