import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Header = () => {
  const navigate=useNavigate()
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      navigate("/sign-in");
    }
  }, []);
  // useEffect(() => {
  //   const email = localStorage.getItem("userEmail");
  //   if (email) {
  //     navigate("/");
  //   }
  // }, []);
  
  const handleLogout=()=>{
    localStorage.removeItem("userEmail");
    navigate("/sign-in");
  }

  return (
    <div className="bg-slate-200">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold">Home</h1>
        </Link>

        <ul className="flex gap-6 items-center">
          
            <>
              <Link to="/user">
                <li className="hover:underline">User</li>
              </Link>
              <Link to="/sales">
                <li className="hover:underline">Sales</li>
              </Link>
              <li
                onClick={handleLogout}
                className="cursor-pointer text-red-600 font-medium hover:underline"
              >
                Logout
              </li>
            </>
        </ul>
      </div>
    </div>
  );
};

export default Header;
