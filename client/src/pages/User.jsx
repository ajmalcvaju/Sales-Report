import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, Search } from "lucide-react";
import axios from "axios";
import Header from "../components/Header";

const defaultUser = {
  name: "",
  email: "",
  role: "",
};

const User = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultUser);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  useEffect(()=>{
      const email = localStorage.getItem('userEmail');
      if(!email){
        navigate("/sign-in")
      }
    },[])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("https://machine-task-1-main.onrender.com/api/customer");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const res = await axios.post(
          `https://machine-task-1-main.onrender.com/api/customer/update/${editUserId}`,
          formData
        );
        const updatedUser = res.data;
        setUsers((prev) =>
          prev.map((u) => (u._id === editUserId ? updatedUser : u))
        );
      } else {
        const res = await axios.post(
          "https://machine-task-1-main.onrender.com/api/customer/create",
          formData
        );
        setUsers((prev) => [...prev, res.data]);
      }

      // Reset
      setFormData(defaultUser);
      setShowForm(false);
      setIsEditMode(false);
      setEditUserId(null);
    } catch (err) {
      console.error("Error submitting user:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://machine-task-1-main.onrender.com/api/customer/delete/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return (
    <div className="px-4 py-12 max-w-5xl mx-auto">
      <Header/>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          User Management
        </h1>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or mobileNumber..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={() => {
            setFormData(defaultUser);
            setIsEditMode(false);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          <PlusCircle size={18} />
          Add User
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-xl mx-auto bg-white p-6 rounded-xl shadow-xl relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? "Edit User" : "Add User"}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-2 border rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full p-2 border rounded-md"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="mobileNumber"
                  className="w-full p-2 border rounded-md"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(defaultUser);
                    setIsEditMode(false);
                    setEditUserId(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setShowForm(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Address</th>
              <th className="px-4 py-4 text-left">Mobile Number</th>
              <th className="px-4 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length > 0 ? (
              filtered.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.address}</td>
                  <td className="px-4 py-4 text-slate-600">{user.mobileNumber}</td>
                  <td className="px-4 py-4 text-center flex justify-center gap-3">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                      title="Edit"
                      onClick={() => {
                        setFormData(user);
                        setEditUserId(user._id);
                        setIsEditMode(true);
                        setShowForm(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                      title="Delete"
                      onClick={() => handleDelete(user._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default User;
