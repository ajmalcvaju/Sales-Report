import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

const PrivateAdminRoute = () => {
    const {admin}=useSelector(state=>state.admin)
  return admin?<Outlet/>:<Navigate to="/admin"/>
}

export default PrivateAdminRoute