import { useEffect, useState } from "react";
import { Pencil, Trash2, PlusCircle, Search } from "lucide-react";
import axios from "axios";
import Header from "../components/Header";
import { fetchProduct, getCustomerData, getProductData } from "../api/api";

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
  const [purchaseModel, setPurchaseModel] = useState(false);
  const [sellModel, setSellModel] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [items, setItems] = useState([]);
  const currentDate = new Date().toLocaleDateString("en-GB");
  const [users, setUsers] = useState([]);
  const [lastSale,setLastSale]=useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res= await getProductData();
        console.log(res.data)
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductData();
        console.log(res.data);
        setItems(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getCustomerData()
        console.log(res.data)
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
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
          `http://localhost:3000/api/products/update-product/${editProductId}`,
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
          "http://localhost:3000/api/products/create-product",
          formData
        );
        setProducts([...products, formData]);
      }

      // Reset form and edit mode
      setFormData(defaultProduct);
      setShowForm(false);
      setIsEditMode(false);
      setEditProductId(null);
      window.location.reload();
    } catch (error) {
      console.error(
        "Error submitting product:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/products/delete-product/${id}`);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      window.location.reload();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete product");
    }
  };

  const sell = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/products/sell/${id}`);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      window.location.reload();
    } catch (err) {
      console.error("Selling failed", err);
      alert("Failed to sell product");
    }
  };

  const purchase = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/products/purchase/${id}`);
      setProducts((prev) => prev.filter((item) => item._id !== id));
      window.location.reload();
    } catch (err) {
      console.error("Purchase failed", err);
      alert("Failed to purchase product");
    }
  };

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    console.log(value);
    setCustomerName(value);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setSelectedCustomerId("");
    
  };

  const handleSoldProductSelect = (index, selectedName) => {
    const product = items.find((p) => p.name === selectedName);
    if (!product) return;

    const updated = [...soldItems];
    updated[index] = {
      ...updated[index],
      productId: product._id,
      name: product.name,
      pricePerItem: product.price,
    };
    setSoldItems(updated);
  };

  const handleSoldChange = (index, field, value) => {
    const updated = [...soldItems];
    updated[index][field] =
      field === "quantity" ? parseInt(value, 10) || 0 : value;
    setSoldItems(updated);
  };

  const totalPricePerItem = (item) =>
    (item.quantity || 0) * (item.pricePerItem || 0);

  const grandTotal = soldItems.reduce(
    (sum, item) => sum + totalPricePerItem(item),
    0
  );
  const handleRemoveSoldItem = (index) => {
    const updated = soldItems.filter((_, i) => i !== index);
    setSoldItems(updated);
  };
  const defaultSoldItem = {
    productId: "",
    name: "",
    quantity: 0,
    pricePerItem: 0,
  };

  const isItemFilled = (item) => {
    return (
      item.productId && item.name && item.quantity > 0 && item.pricePerItem > 0
    );
  };

  const handleAddSoldItem = () => {
    const lastItem = soldItems[soldItems.length - 1];
    if (!lastItem || isItemFilled(lastItem)) {
      setSoldItems([...soldItems, { ...defaultSoldItem }]);
    } else {
      alert("Please fill in the last item before adding a new one.");
    }
  };

  const handleConfirmSale = async () => {
    try {
      if (!selectedCustomerId) {
        alert("Please select a valid customer from the list.");
        return;
      }
     console.log(soldItems)
      const saleData = {
        userId: selectedCustomerId,
        customerName,
        date: currentDate,
        items: soldItems.map((item) => ({
          productName:item.name,
          productId: item.productId,
          price:item.pricePerItem,
          quantity: item.quantity,
        })),
      };
      let sale;
      if (sellModel) {
        const res = await axios.patch(
          "http://localhost:3000/api/products/sale",
          saleData
        );
        sale = res.data.sale;
        alert("Item sold successfully")
        window.location.reload();
      } else {
        const res = await axios.patch(
          "http://localhost:3000/api/products/purchase",
          saleData
        );
        sale = res.data.sale;
        alert("Item purchased successfully")
        window.location.reload();

      }
      setLastSale(sale);
      setPurchaseModel(false);
      setSellModel(false);
      setSoldItems([]);
      setCustomerName("");
      setSelectedCustomerId("");
    } catch (error) {
      console.error("Failed to confirm sale:", error);
      alert("Failed to confirm sale. Please try again.");
    }
  };

  const handleSelectUser = (user) => {
    setCustomerName(user.name);
    setSelectedCustomerId(user._id);
    setFilteredUsers([]);
  };

  return (
    <div className="px-4 py-12 max-w-5xl mx-auto">
      <Header />
      {sellModel && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 rounded-lg w-full max-w-5xl shadow-lg space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Billing</h2>

            {/* Customer Name & Date */}
            <div className="relative flex justify-between items-center gap-4">
              <div className="w-1/2 relative">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={handleCustomerNameChange}
                  className="border p-2 rounded w-full"
                />
                {filteredUsers.length > 0 && (
                  <ul className="absolute bg-white border w-full max-h-48 overflow-y-auto z-10">
                    {filteredUsers.map((user) => (
                      <li
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {user.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="text-gray-600 font-medium">
                Date: {currentDate}
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 font-semibold border-b pb-2 mt-4">
              <div>Item</div>
              <div>Quantity</div>
              <div>Price per Item</div>
              <div>Total</div>
              <div>Action</div>
            </div>

            {/* Sold Item Rows */}
            {soldItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-6 gap-4 items-center border-b py-2"
              >
                <select
                  value={item.name || ""}
                  onChange={(e) =>
                    handleSoldProductSelect(index, e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option value="">Select Product</option>
                  {items.map((product) => (
                    <option key={product._id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleSoldChange(index, "quantity", e.target.value)
                  }
                  className="border p-2 rounded"
                  defaultValue={0}
                  min={0}
                  max={
                    items.find((p) => p._id === item.productId)?.quantity || 0
                  }
                />

                <input
                  type="number"
                  value={item.pricePerItem || ""}
                  readOnly
                  className="border p-2 rounded bg-gray-100"
                />

                <div className="text-center">₹{totalPricePerItem(item)}</div>

                <button
                  onClick={() => handleRemoveSoldItem(index)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={handleAddSoldItem}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Add Item
            </button>

            <div className="mt-4 text-lg font-semibold text-right">
              Grand Total: ₹{grandTotal}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setSellModel(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSale}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
      {purchaseModel && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative bg-white p-6 rounded-lg w-full max-w-5xl shadow-lg space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Purchase Billing</h2>

            {/* Customer Name & Date */}
            <div className="relative flex justify-between items-center gap-4">
              <div className="w-1/2 relative">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={handleCustomerNameChange}
                  className="border p-2 rounded w-full"
                />
                {filteredUsers.length > 0 && (
                  <ul className="absolute bg-white border w-full max-h-48 overflow-y-auto z-10">
                    {filteredUsers.map((user) => (
                      <li
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {user.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="text-gray-600 font-medium">
                Date: {currentDate}
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 font-semibold border-b pb-2 mt-4">
              <div>Item</div>
              <div>Quantity</div>
              <div>Price per Item</div>
              <div>Total</div>
              <div>Action</div>
            </div>

            {/* Sold Item Rows */}
            {soldItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-6 gap-4 items-center border-b py-2"
              >
                <select
                  value={item.name || ""}
                  onChange={(e) =>
                    handleSoldProductSelect(index, e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option value="">Select Product</option>
                  {items.map((product) => (
                    <option key={product._id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleSoldChange(index, "quantity", e.target.value)
                  }
                  className="border p-2 rounded"
                  defaultValue={0}
                  min={0}
                  max={
                    items.find((p) => p._id === item.productId)?.quantity || 0
                  }
                />

                <input
                  type="number"
                  value={item.pricePerItem || ""}
                  readOnly
                  className="border p-2 rounded bg-gray-100"
                />

                <div className="text-center">₹{totalPricePerItem(item)}</div>

                <button
                  onClick={() => handleRemoveSoldItem(index)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={handleAddSoldItem}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Add Item
            </button>

            <div className="mt-4 text-lg font-semibold text-right">
              Grand Total: ₹{grandTotal}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setPurchaseModel(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSale}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
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
        <span
          className="bg-green-600 px-4 py-2 rounded-xl text-white hover:cursor-pointer"
          onClick={() => setPurchaseModel(true)}
        >
          Purchase
        </span>
        <span
          className="bg-red-600 px-4 py-2 rounded-xl text-white hover:cursor-pointer"
          onClick={() => setSellModel(true)}
        >
          Sell
        </span>

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
