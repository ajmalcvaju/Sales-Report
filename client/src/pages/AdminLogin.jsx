import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, adminLoginFailure } from "../redux/admin/adminSlice.js";
import { useDispatch, useSelector } from 'react-redux'


const Signin = () => {
    const [formData,setFormData]=useState({})
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const { admin, isLogged } = useSelector((state) => state.admin);
    const handleChange=(e)=>{
        setFormData({...formData,[e.target.id]:e.target.value})
    }
    useEffect(() => {
        if (isLogged) {
          navigate("/admin/Dashboard");
        }
      }, []);
    const handleSubmit=async(e)=>{
        e.preventDefault()
        try {
            const res=await fetch('/api/admin/adminLogin',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify(formData)
            }
            )
            const data=await res.json()
            dispatch(adminLogin(data));
            if(data.success===false){
                dispatch(adminLoginFailure(data));
                return
            }
            console.log("succeess")
            navigate("/admin/Dashboard")
        } catch (error) {
            dispatch(adminLoginFailure(error));       
        }        
    }
    
  return (
    <div className='p-3 max-w-lg mt-20 mx-auto'>
        <h1 className='text-3xl text-center font-semibold my-7 '>Admin Login In</h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <input type='text' placeholder='Username' id='username' className='bg-slate-100 p-3
            rounded-lg' onChange={handleChange}/>
            <input type='password' placeholder='Password' id='password' className='bg-slate-100 p-3
            rounded-lg' onChange={handleChange}/>
            <button  className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95
            disabled:opacity-80'>
                Sign In
            </button>
        </form>
    </div>
  )
}

export default Signin