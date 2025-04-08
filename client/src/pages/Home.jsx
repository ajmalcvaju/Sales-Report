import { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, Search } from "lucide-react";
import axios from "axios";
import Header from "../components/Header";

const initialProducts = [
  {
    id: 1,
    name: "Product A",
    description: "Sample item A",
    quantity: 10,
    price: 50,
  },
  {
    id: 2,
    name: "Product B",
    description: "Another item B",
    quantity: 5,
    price: 30,
  },
];

const defaultProduct = {
  name: "",
  description: "",
  quantity: null,
  price: null,
};

export default function Home() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultProduct);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  const filtered = products.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        console.log(editProductId);
        const res = await axios.post(
          `http://localhost:3000/api/products/update/${editProductId}`,
          formData
        );
        const updatedProduct = res.data;

        setProducts((prev) =>
          prev.map((item) =>
            item._id === editProductId ? updatedProduct : item
          )
        );
      } else {
        const res = await axios.post(
          "http://localhost:3000/api/products/create",
          formData
        );
        setProducts([...products, formData]);
      }

      // Reset form and edit mode
      setFormData(defaultProduct);
      setShowForm(false);
      setIsEditMode(false);
      setEditProductId(null);
    } catch (error) {
      console.error(
        "Error submitting product:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/products/delete/${id}`);
      setProducts((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="px-4 py-12 max-w-5xl mx-auto">
      <Header/>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Inventory Management
        </h1>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="relative w-full sm:w-1/2">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => {
            setFormData(defaultProduct);
            setIsEditMode(false);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} />
          Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-xl mx-auto bg-white p-6 rounded-xl shadow-xl relative">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? "Edit Product" : "Add Product"}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full p-2 border rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-2 border rounded-md"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  className="w-full p-2 border rounded-md"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full p-2 border rounded-md"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(defaultProduct);
                    setIsEditMode(false);
                    setEditProductId(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
              <th className="px-6 py-4 text-left">Description</th>
              <th className="px-4 py-4 text-left">Quantity</th>
              <th className="px-4 py-4 text-left">Price</th>
              <th className="px-4 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length > 0 ? (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {product.description}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {product.quantity}
                  </td>
                  <td className="px-4 py-4 text-slate-600">${product.price}</td>
                  <td className="px-4 py-4 text-center flex justify-center gap-3">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                      title="Edit"
                      onClick={() => {
                        setFormData(product);
                        setEditProductId(product._id);
                        setIsEditMode(true);
                        setShowForm(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                      title="Delete"
                      onClick={() => handleDelete(product._id)} // assuming each product has _id
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-slate-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
