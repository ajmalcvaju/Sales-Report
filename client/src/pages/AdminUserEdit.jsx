import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2';
import { Navigate, useNavigate, useParams } from 'react-router-dom'

const AdminUserEdit = () => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const Navigate=useNavigate()
    const {id}=useParams()
    useEffect(()=>{
      axios.get(`/api/admin/editUser/${id}`)
      .then((res)=>{
        console.log(res.data)
        setUserName(res.data.username)
        setEmail(res.data.email)
      }).catch((error)=>{
        console.log(error)
      })
    },[id])
    const handleSubmit=async(e)=>{
      e.preventDefault()
      try {
        const res=await fetch(`/api/admin/editUser/${id}`,{
          method:"POST",
          headers:{
            'Content-type':'application/json'
          },
          body:JSON.stringify({
            username:userName,
            email:email
          })
        })
        const data=await res.json()
        if(data.success===false){
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error updating the user details. Please try again.',
            });
          return
        }
        Swal.fire({
            icon: 'success',
            title: 'User Details Updated!',
            text: 'The user details have been edited successfully.',
        }).then(() => {
            Navigate("/admin/Dashboard");
        });
      } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error updating the user details. Please try again.',
        });
      }
    }
  return (
    <div className="p-3 max-w-lg mx-auto mt-14">
      <h1 className="text-3xl text-slate-700 font-semibold text-center my-7">Edit User</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          defaultValue={userName}
          type="text"
          id="username"
          placeholder='Username'
          className="bg-slate-100 rounded-lg p-3"
          onChange={(e)=>setUserName(e.target.value)}
          />
        <input
          defaultValue={email}
          type="email"
          id="email"
          placeholder='Email'
          className="bg-slate-100 rounded-lg p-3"
          onChange={(e)=>setEmail(e.target.value)}
        />
        
        <button type='submit' className="bg-slate-600 text-white rounded-lg uppercase hover:opacity-85 disabled:opacity-80 max-w-lg p-2 my-2">
          Edit User
        </button>
      </form>
    </div>  
  )
}

export default AdminUserEdit