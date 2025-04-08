import mongoose from "mongoose";


const customerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,

    },
    address:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:Number,
        required:true
    }
},{timestamps:true})

const Customer=mongoose.model("Customer",customerSchema)

export default Customer;