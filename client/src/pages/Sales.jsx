import axios from "axios";
import React, { useEffect, useState } from "react";
import Invoice from "./Invoice";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "../components/Header";

const Sales = () => {
  const [showModal, setShowModal] = useState(false);
  const [soldItems, setSoldItems] = useState([]);
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [lastSale, setLastSale] = useState(null);
  const [salesReport, setSalesReport] = useState([]);
  const [showSalesReportModal, setShowSalesReportModal] = useState(false);
  const [itemsReport, setItemsReport] = useState([]);
  const [showItemsReportModal, setShowItemsReportModal] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [printModel, setPrintModel] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-GB");

  useEffect(()=>{
        const email = localStorage.getItem('userEmail');
        if(!email){
          navigate("/sign-in")
        }
      },[])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://sales-report-oohs.onrender.com/api/products");
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
        const res = await axios.get("https://sales-report-oohs.onrender.com/api/customer");
        console.log(res.data);
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      const res = await axios.get("https://sales-report-oohs.onrender.com/api/products/sales");
      console.log(res.data);
      setSalesReport(res.data);
    } catch (error) {
      console.error("Failed to fetch sales report:", error);
      alert("Could not fetch sales report.");
    }
  };

  const fetchItemsReport = async () => {
    try {
      const res = await axios.get("https://sales-report-oohs.onrender.com/api/products");
      setItemsReport(res.data);
      setShowItemsReportModal(true);
    } catch (error) {
      console.error("Failed to fetch items report:", error);
      alert("Could not fetch items report.");
    }
  };

  const handleAddSoldItem = () => {
    setSoldItems([
      ...soldItems,
      { productId: "", name: "", quantity: 0, pricePerItem: 0 },
    ]);
  };

  const handleRemoveSoldItem = (index) => {
    const updated = soldItems.filter((_, i) => i !== index);
    setSoldItems(updated);
  };

  const handleSoldChange = (index, field, value) => {
    const updated = [...soldItems];
    updated[index][field] =
      field === "quantity" ? parseInt(value, 10) || 0 : value;
    setSoldItems(updated);
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

  const totalPricePerItem = (item) =>
    (item.quantity || 0) * (item.pricePerItem || 0);

  const grandTotal = soldItems.reduce(
    (sum, item) => sum + totalPricePerItem(item),
    0
  );

  // --- Customer selection handlers ---
  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setCustomerName(value);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    // Reset selectedCustomerId if input is modified
    setSelectedCustomerId("");
  };

  const handleSelectUser = (user) => {
    setCustomerName(user.name);
    setSelectedCustomerId(user._id);
    setFilteredUsers([]);
  };

  const handleConfirmSale = async () => {
    try {
      if (!selectedCustomerId) {
        alert("Please select a valid customer from the list.");
        return;
      }

      const saleData = {
        userId: selectedCustomerId, // sending the selected customer's _id
        customerName, // optional if you want to send the name as well
        date: currentDate,
        items: soldItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const res = await axios.patch(
        "https://sales-report-oohs.onrender.com/api/products/sale",
        saleData
      );
      const sale = res.data.sale;

      setLastSale(sale);
      setShowModal(false);
      setSoldItems([]);
      setCustomerName("");
      setSelectedCustomerId("");
    } catch (error) {
      console.error("Failed to confirm sale:", error);
      alert("Failed to confirm sale. Please try again.");
    }
  };

  const toggleLedger = () => setIsLedgerOpen(!isLedgerOpen);

  const customers = [...new Set(salesReport.map((sale) => sale.customerName))];

  const customerSales = salesReport.filter(
    (sale) => sale.customerName === selectedCustomer
  );

  const getProductDetails = (id) => {
    const product = items.find((p) => p._id === id);
    return product
      ? { name: product.name, price: product.price }
      : { name: "Unknown", price: 0 };
  };
  const exportToExcel = () => {
    const data = customerSales.flatMap((sale) =>
      sale.items.map((item) => {
        const { name, price } = getProductDetails(item.productId);
        return {
          Customer: sale.customerName,
          Date: sale.date,
          Product: name,
          Quantity: item.quantity,
          Price: price,
          Total: item.quantity * price,
        };
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Ledger");
    XLSX.writeFile(workbook, "customer_ledger.xlsx");
  };

  const itemExportToExcel = () => {
    if (!itemsReport || itemsReport.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(itemsReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items Report");
    XLSX.writeFile(workbook, "items_report.xlsx");
  };

  const exportToPdf = () => {
    const element = document.querySelector(".max-w-3xl");

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("customer_ledger.pdf");
    });
  };

  const sendEmail = () => {
    const body = encodeURIComponent(
      "Customer Ledger Attached.\n\nDownload PDF or Excel and attach to your mail."
    );
    window.open(`mailto:?subject=Customer Ledger&body=${body}`, "_blank");
  };

  const salesExportToExcel = () => {
    if (!salesReport || salesReport.length === 0) return;

    // Step 1: Aggregate product quantities
    const aggregatedData = salesReport
      .flatMap((sale) =>
        sale.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      )
      .reduce((acc, curr) => {
        if (!acc[curr.productId]) {
          acc[curr.productId] = {
            productId: curr.productId,
            quantity: curr.quantity,
          };
        } else {
          acc[curr.productId].quantity += curr.quantity;
        }
        return acc;
      }, {});

    // Step 2: Map to final export format
    const finalData = Object.values(aggregatedData).map((data) => {
      const product = items.find((it) => it._id === data.productId);
      const name = product ? product.name : "Unknown";
      const price = product ? product.price : 0;
      const total = price * data.quantity;

      return {
        Product: name,
        Quantity: data.quantity,
        Price: price,
        Total: total,
      };
    });

    // Step 3: Convert to worksheet and export
    const worksheet = XLSX.utils.json_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-10">
      <Header/>
      {/* Sales Report Modal */}
      {showSalesReportModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-6xl shadow-lg space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Sales Report</h2>

            <div className="grid grid-cols-3 gap-4 font-semibold border-b py-2 px-4 bg-gray-100">
              <div>Product</div>
              <div>Quantity</div>
              <div>Total Price</div>
            </div>

            {salesReport.length === 0 ? (
              <p>No sales yet.</p>
            ) : (
              Object.values(
                salesReport
                  .flatMap((sale) =>
                    sale.items.map((item) => ({
                      productId: item.productId,
                      quantity: item.quantity,
                    }))
                  )
                  .reduce((acc, curr) => {
                    if (!acc[curr.productId]) {
                      acc[curr.productId] = {
                        productId: curr.productId,
                        quantity: curr.quantity,
                      };
                    } else {
                      acc[curr.productId].quantity += curr.quantity;
                    }
                    return acc;
                  }, {})
              ).map((data, idx) => {
                const product = items.find((it) => it._id === data.productId);
                const name = product ? product.name : "Unknown";
                const price = product ? product.price : 0;
                const totalPrice = price * data.quantity;

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-3 gap-4 items-center border-b py-2 px-4"
                  >
                    <div>{name}</div>
                    <div>{data.quantity}</div>
                    <div>₹{totalPrice}</div>
                  </div>
                );
              })
            )}

            <div className="flex justify-end pt-4">
              <div className="flex gap-3 mb-4">
                <button
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  onClick={() => window.print()}
                >
                  Print
                </button>

                <button
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  onClick={salesExportToExcel}
                >
                  Excel
                </button>

                <button
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={exportToPdf}
                >
                  PDF
                </button>

                <button
                  className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700"
                  onClick={sendEmail}
                >
                  Email
                </button>
              </div>
              <button
                onClick={() => setShowSalesReportModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Report Modal */}
      {showItemsReportModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-6xl shadow-lg space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Items Report</h2>

            <div className="grid grid-cols-3 gap-4 font-semibold border-b py-2 px-4 bg-gray-100">
              <div>Product</div>
              <div>Available Quantity</div>
              <div>Price</div>
            </div>

            {itemsReport.length === 0 ? (
              <p>No items found.</p>
            ) : (
              itemsReport.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-4 items-center border-b py-2 px-4"
                >
                  <div>{item.name}</div>
                  <div>{item.quantity}</div>
                  <div>₹{item.price}</div>
                </div>
              ))
            )}

            <div className="flex justify-end pt-4">
              <div className="flex gap-3 mb-4">
                <button
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  onClick={() => window.print()}
                >
                  Print
                </button>

                <button
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  onClick={itemExportToExcel}
                >
                  Excel
                </button>

                <button
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={exportToPdf}
                >
                  PDF
                </button>

                <button
                  className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700"
                  onClick={sendEmail}
                >
                  Email
                </button>
              </div>
              <button
                onClick={() => setShowItemsReportModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {lastSale && (
        <Invoice
          sale={lastSale}
          products={items}
          onClose={() => setLastSale(null)}
        />
      )}

      <h1 className="text-2xl font-bold mb-6">Sales Management</h1>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-64"
      >
        Sell Product
      </button>

      <button
        onClick={() => {
          fetchSalesReport;
          setShowSalesReportModal(true);
        }}
        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 w-64"
      >
        Sales Report
      </button>

      <button
        onClick={fetchItemsReport}
        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 w-64"
      >
        Items Report
      </button>

      <button
        className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 w-64"
        onClick={toggleLedger}
      >
        Customer Ledger
      </button>

      {isLedgerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50">
          <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg relative overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">Customer Ledger</h2>

            <label className="block mb-4">
              Select Customer:
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="block mt-1 w-full border p-2 rounded"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            {selectedCustomer && customerSales.length > 0 ? (
              <div className="space-y-4">
                {customerSales.map((sale, index) => {
                  const total = sale.items.reduce((sum, item) => {
                    const { price } = getProductDetails(item.productId);
                    return sum + price * item.quantity;
                  }, 0);

                  return (
                    <div
                      key={sale._id}
                      className="border p-4 rounded bg-gray-50"
                    >
                      <div className="font-semibold">Date: {sale.date}</div>
                      <div className="mt-2">
                        <ul className="list-disc pl-5">
                          {sale.items.map((item, i) => {
                            const { name, price } = getProductDetails(
                              item.productId
                            );
                            return (
                              <li key={i}>
                                {name} - Qty: {item.quantity} × ₹{price} = ₹
                                {item.quantity * price}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="mt-2 font-bold text-right text-green-700">
                        Grand Total: ₹{total}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedCustomer ? (
              <p className="text-gray-500">No sales found for this customer.</p>
            ) : null}
            <div className="absolute top-2 right-2 flex gap-x-4">
              <div className="flex gap-3 mb-4">
                <button
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  onClick={() => window.print()}
                >
                  Print
                </button>

                <button
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  onClick={exportToExcel}
                >
                  Excel
                </button>

                <button
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={exportToPdf}
                >
                  PDF
                </button>

                <button
                  className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700"
                  onClick={sendEmail}
                >
                  Email
                </button>
              </div>

              <button
                className="text-red-500 hover:underline"
                onClick={toggleLedger}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Billing Modal */}
      {showModal && (
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
                onClick={() => setShowModal(false)}
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
    </div>
  );
};

export default Sales;
