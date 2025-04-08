import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const AdminAddUser = () => {
    const [formData,setFormData]=useState({})
    const navigate=useNavigate()
    const handleChange=(e)=>{
        setFormData({...formData,[e.target.id]:e.target.value})
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        try {
            // setLoading(true)
            // setError(false)
            const res=await fetch('/api/admin/addUser',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify(formData)
            }
            )
            const data=await res.json()
            console.log(data)
            // // setLoading(false)
            if(data.success===false){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Could not add user. Username or email already exists!',
                });
                return
            }
            Swal.fire({
                icon: 'success',
                title: 'User Added Successfully!',
                text: 'The new user has been added successfully.',
            }).then(() => {
                navigate('/admin/Dashboard');
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong while adding the user!',
            });
        }
    }
  return (
    <div className="p-3 max-w-lg mx-auto mt-14">
      <h1 className="text-3xl text-slate-700 font-semibold text-center my-7">Add User</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          placeholder="User Name"
          type="text"
          id="username"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handleChange}
          autoComplete="username"
        />
        <input
          placeholder="Email"
          type="email"
          id="email"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handleChange}
          autoComplete="email"
        />
        <input
          placeholder="Password"
          type="password"
          id="password"
          className="bg-slate-100 rounded-lg p-3"
          onChange={handleChange}
          autoComplete="new-password"
        />
        <button type="submit" className="bg-slate-600 text-white rounded-lg uppercase hover:opacity-85 disabled:opacity-80 max-w-lg p-2 my-2">
          Add User
        </button>
      </form>
      {/* {error && <p className="text-red-700 mt-5">{error}</p>} */}
    </div>
  )
}

export default AdminAddUser