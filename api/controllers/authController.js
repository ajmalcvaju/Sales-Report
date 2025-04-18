// import bcryptjs from 'bcryptjs'
// import User from "../models/user.js"
import { errorHandler } from '../utils/error.js'
import jwt from 'jsonwebtoken'
import StatusCodes from '../utils/constants.js';


export const signin=async (req, res, next) => {
    try {
        console.log(req.body)
      const { email, password } = req.body;
      if(email == process.env.email || password == process.env.password){
        const token = jwt.sign({ id: 'dummyUserId' }, process.env.JWT_SECRET);
      res
        .cookie('access_token', token, {
          httpOnly: true,
          expires: new Date(Date.now() + 3600000),
        })
        .status(StatusCodes.OK)
        .json({ message: 'Login successful', email, token });
      }else{
        next(errorHandler(401, 'Invalid email or password'));
      }
    } catch (err) {
      next(err);
    }
  };
