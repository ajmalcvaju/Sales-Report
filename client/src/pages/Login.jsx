import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate=useNavigate()

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', { // update to your backend route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Login Success:', data);
        localStorage.setItem('userEmail', data.email);
        navigate('/');
      } else {
        console.error('Login Failed:', data.message);
      }
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  };
  useEffect(()=>{
    const email = localStorage.getItem('userEmail');
    if(email){
      navigate("/")
    }
  },[])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
  <form
    onSubmit={handleSubmit}
    className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md transition duration-300 ease-in-out transform hover:scale-105"
  >
    <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
      🚀 Welcome Back!
    </h2>

    <input
      type="text"
      name="email"
      placeholder="Enter your email"
      value={formData.email}
      onChange={handleChange}
      className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      required
    />

    <input
      type="password"
      name="password"
      placeholder="Enter your password"
      value={formData.password}
      onChange={handleChange}
      className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      required
    />

    <button
      type="submit"
      className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
    >
      Login
    </button>
  </form>
</div>

  );
};

export default Login;
