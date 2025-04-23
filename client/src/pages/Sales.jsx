import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fetchAllProductData } from "../api/api";

const Sales = () => {
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesModel, setSalesModel] = useState(false);
  const [itemsModel, setItemsModel] = useState(false);
  const [ledgerModel, setLedgerModel] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModel, setShowHistoryModel] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, purchaseRes, productRes] = await fetchAllProductData();
        console.log(salesRes.data);
        console.log(purchaseRes.data);
        console.log(productRes.data);
        setSalesData(salesRes.data);
        setPurchaseData(purchaseRes.data);
        setProducts(productRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const result = salesData.filter((sale) => {
      const matchesCustomer = sale.customerName
        .toLowerCase()
        .includes(customerFilter.toLowerCase());
      const matchesDate = dateFilter === "" || sale.date === dateFilter;
      return matchesCustomer && matchesDate;
    });
    setFilteredSales(result);
  }, [customerFilter, dateFilter, salesData]);

  const uniqueCustomers = [...new Set(salesData.map((s) => s.customerName))];
  const uniqueDates = [...new Set(salesData.map((s) => s.date))];

  // 📦 Calculate Item Report
  const itemReport = products.map((product) => {
    const totalPurchased = purchaseData.reduce((sum, purchase) => {
      return (
        sum +
        purchase.items.reduce((subSum, item) => {
          return item.productName === product.name
            ? subSum + item.quantity
            : subSum;
        }, 0)
      );
    }, 0);

    const totalSold = salesData.reduce((sum, sale) => {
      return (
        sum +
        sale.items.reduce((subSum, item) => {
          return item.productName === product.name
            ? subSum + item.quantity
            : subSum;
        }, 0)
      );
    }, 0);

    return {
      name: product.name,
      purchased: totalPurchased,
      sold: totalSold,
      currentStock: product.quantity,
    };
  });

  const formatEntry = (entry, type) => ({
    date: entry.date,
    customerName: entry.customerName,
    amount: entry.items.reduce((sum, item) => sum + item.price, 0),
    type,
  });
   
  const ledger = [
    ...salesData.map((item) => formatEntry(item, "IN")),
    ...purchaseData.map((item) => formatEntry(item, "OUT")),
  ];
  const dateSortedLedger=ledger.forEach((led)=>{
    if(led.date.split("/"))
  })

  const filteredLedger = ledger.filter((entry) => {
    const matchName = customerFilter
      ? entry.customerName.toLowerCase().includes(customerFilter.toLowerCase())
      : true;
    const matchDate = dateFilter ? entry.date === dateFilter : true;
    return matchName && matchDate;
  });

  const handleDownloadPDF = async () => {
    const report = document.getElementById("sales-report");
    const canvas = await html2canvas(report);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("sales_report.pdf");
  };

  const handleDownloadExcel = () => {
    const data = [];

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        data.push({
          Customer: sale.customerName,
          Date: sale.date,
          Product: item.productName,
          Quantity: item.quantity,
          Price: item.price,
          Subtotal: item.quantity * item.price,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "sales_report.xlsx");
  };
  const handleItemDownloadPDF = async () => {
    const report = document.getElementById("item-report");
    const canvas = await html2canvas(report);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("item_report.pdf");
  };

  const handleItemDownloadExcel = () => {
    const data = itemReport.map((item) => ({
      Product: item.name,
      Purchased: item.purchased,
      Sold: item.sold,
      "Current Stock": item.currentStock,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "items_report.xlsx");
  };

  const handleLedgerDownloadPDF = async () => {
    const report = document.getElementById("ledger-report");
    const canvas = await html2canvas(report);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("ledger_report.pdf");
  };

  const handleLedgerDownloadExcel = () => {
    const data = filteredLedger.map((entry) => ({
      Date: entry.date,
      Customer: entry.customerName,
      "IN (Sales)": entry.type === "IN" ? entry.amount : "",
      "OUT (Purchase)": entry.type === "OUT" ? entry.amount : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "ledger_report.xlsx");
  };

  const handleShowHistory = (item) => {
    const name = item.name;

    const purchaseHistory = purchaseData.flatMap((entry) =>
      entry.items
        .filter((i) => i.productName === name)
        .map((i) => ({
          date: entry.date,
          quantity: i.quantity,
          type: "Purchased",
        }))
    );

    const salesHistory = salesData.flatMap((entry) =>
      entry.items
        .filter((i) => i.productName === name)
        .map((i) => ({
          date: entry.date,
          quantity: i.quantity,
          type: "Sold",
        }))
    );

    const combinedHistory = [...purchaseHistory, ...salesHistory].sort(
      (a, b) => {
        const [d1, m1, y1] = a.date.split("/").map(Number);
        const [d2, m2, y2] = b.date.split("/").map(Number);
        return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1); // descending
      }
    );

    setHistoryData(combinedHistory);
    setShowHistoryModel(true);
  };

  const handleSendReport = async (email) => {
    const report = document.getElementById("sales-report");
  
    // Generate PDF
    const canvas = await html2canvas(report);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    const pdfBlob = pdf.output("blob");
  
    // Generate Excel
    const data = [];
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        data.push({
          Customer: sale.customerName,
          Date: sale.date,
          Product: item.productName,
          Quantity: item.quantity,
          Price: item.price,
          Subtotal: item.quantity * item.price,
        });
      });
    });
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const excelBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    // Prepare form data
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "sales_report.pdf");
    formData.append("excel", excelBlob, "sales_report.xlsx");
    formData.append("email",email);
  
    try {
      await axios.post("http://localhost:3000/api/products/send-report", formData);
      alert("Report sent to Gmail successfully!");
    } catch (err) {
      console.error("Error sending report:", err);
    }
  };

  const handleItemSendReport = async (email) => {
    const report = document.getElementById("item-report");
  
    // Generate PDF from HTML
    const canvas = await html2canvas(report);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    const pdfBlob = pdf.output("blob");
  
    // Generate Excel from data
    const data = itemReport.map((item) => ({
      Product: item.name,
      Purchased: item.purchased,
      Sold: item.sold,
      "Current Stock": item.currentStock,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items Report");
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const excelBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    // Prepare FormData
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "items_report.pdf");
    formData.append("excel", excelBlob, "items_report.xlsx");
    formData.append("email", email);
  
    try {
      await axios.post("http://localhost:3000/api/products/send-report", formData);
      alert("Item report sent to Gmail successfully!");
    } catch (err) {
      console.error("Error sending item report:", err);
      alert("Failed to send item report!");
    }
  };
  
  const handleLedgerSendReport = async (email) => {
    const report = document.getElementById("ledger-report");
  
    // Generate PDF from HTML
    const canvas = await html2canvas(report);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    const pdfBlob = pdf.output("blob");
  
    // Generate Excel from data
    const data = filteredLedger.map((entry) => ({
      Date: entry.date,
      Customer: entry.customerName,
      "IN (Sales)": entry.type === "IN" ? entry.amount : "",
      "OUT (Purchase)": entry.type === "OUT" ? entry.amount : "",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger Report");
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const excelBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    // Prepare FormData
    const formData = new FormData();
    formData.append("pdf", pdfBlob, "ledger_report.pdf");
    formData.append("excel", excelBlob, "ledger_report.xlsx");
    formData.append("email", email);
  
    try {
      await axios.post("http://localhost:3000/api/products/send-report", formData);
      alert("Ledger report sent to Gmail successfully!");
    } catch (err) {
      console.error("Error sending ledger report:", err);
      alert("Failed to send ledger report!");
    }
  };
  


  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 bg-gray-100 min-h-screen">
      {/* 📊 Sales Report Modal */}
      {salesModel && (
        <div
          id="sales-report"
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50"
        >
          <div className="bg-white w-[90%] md:w-[60%] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-red-600 font-bold text-xl"
              onClick={() => setSalesModel(false)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              📊 Sales Report
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="">-- Select Customer --</option>
                {uniqueCustomers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">-- Select Date --</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            {filteredSales.map((sale) => (
              <div
                key={sale._id}
                className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50"
              >
                <p className="font-bold text-blue-700">
                  Customer:{" "}
                  <span className="font-normal">{sale.customerName}</span>
                </p>
                <p className="text-gray-600 mb-2">Date: {sale.date}</p>
                <ul className="list-disc pl-5">
                  {sale.items.map((item, idx) => (
                    <li key={item._id || idx}>
                      Product: <code>{item.productName}</code> | Quantity:{" "}
                      {item.quantity} | Price: ₹{item.price}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold">
                  Total: ₹
                  {sale.items
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </p>
              </div>
            ))}

            <div className="mt-6 p-4 border-t border-gray-400 font-bold text-xl text-green-700">
              Grand Total: ₹
              {filteredSales
                .reduce((grandSum, sale) => {
                  return (
                    grandSum +
                    sale.items.reduce(
                      (saleSum, item) => saleSum + item.price * item.quantity,
                      0
                    )
                  );
                }, 0)
                .toFixed(2)}
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
              <button
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow"
                onClick={handleDownloadPDF}
              >
                📄 Download PDF
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow"
                onClick={handleDownloadExcel}
              >
                📊 Download Excel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow"
                onClick={() => {
                  const email = prompt("Enter recipient's email:");
                  if (email) {
                    handleSendReport(email);
                  }
                }}
              >
                ✉️ Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📦 Items Report Modal */}
      {showHistoryModel && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] md:w-[60%] max-h-[80vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-red-600 font-bold text-xl"
              onClick={() => setShowHistoryModel(false)}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              📜 Product History
            </h2>
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-center">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((record, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="p-2 border">{record.date}</td>
                    <td className="p-2 border">{record.type}</td>
                    <td className="p-2 border">{record.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {itemsModel && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-30">
          <div className="bg-white w-[95%] md:w-[80%] max-h-[85vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-red-600 font-bold text-xl"
              onClick={() => setItemsModel(false)}
            >
              ✖
            </button>
            <div id="item-report">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                📦 Items Report
              </h2>

              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Purchased</th>
                    <th className="p-2 border">Sold</th>
                    <th className="p-2 border">Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {itemReport.map((item, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="p-2 border">{item.name}</td>
                      <td className="p-2 border">{item.purchased}</td>
                      <td className="p-2 border">{item.sold}</td>
                      <td className="p-2 border">{item.currentStock}</td>
                      <td className="p-2 border">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                          onClick={() => handleShowHistory(item)}
                        >
                          📜 History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleItemDownloadPDF}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow"
              >
                📄 Download PDF
              </button>
              <button
                onClick={handleItemDownloadExcel}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow"
              >
                📊 Download Excel
              </button>
              <button onClick={() => {
                  const email = prompt("Enter recipient's email:");
                  if (email) {
                    handleItemSendReport(email);
                  }
                }} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow">
                ✉️ Send Email
              </button>
            </div>
          </div>
        </div>
      )}
      {ledgerModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setLedgerModel(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>
            <div id="ledger-report">
              {/* Title */}
              <h2 className="text-xl font-bold mb-4 text-center">
                Customer Ledger Report
              </h2>

              {/* Filters */}
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Filter by Customer Name"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="border px-2 py-1 rounded w-full sm:w-1/2"
                />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border px-2 py-1 rounded w-full sm:w-1/2"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Customer</th>
                      <th className="border p-2">IN (Sales)</th>
                      <th className="border p-2">OUT (Purchase)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLedger.map((entry, index) => (
                      
                      <tr key={index}>
                        <td className="border p-2">{entry.date}</td>
                        <td className="border p-2">{entry.customerName}</td>
                        <td className="border p-2 text-green-600">
                          {entry.type === "IN" ? `₹${entry.amount}` : "-"}
                        </td>
                        <td className="border p-2 text-red-600">
                          {entry.type === "OUT" ? `₹${entry.amount}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleLedgerDownloadPDF}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow"
              >
                📄 Download PDF
              </button>
              <button
                onClick={handleLedgerDownloadExcel}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow"
              >
                📊 Download Excel
              </button>
              <button onClick={() => {
                  const email = prompt("Enter recipient's email:");
                  if (email) {
                    handleLedgerSendReport(email);
                  }
                }} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow">
                ✉️ Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔘 Buttons */}
      <Header />
      <button
        onClick={() => setSalesModel(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-transform duration-200 hover:scale-105"
      >
        ➔ Sales Report
      </button>
      <button
        onClick={() => setItemsModel(true)}
        className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-700 transition-transform duration-200 hover:scale-105"
      >
        ➔ Items Report
      </button>
      <button
        onClick={() => setLedgerModel(true)}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-purple-700 transition-transform duration-200 hover:scale-105"
      >
        ➔ Customer Ledger
      </button>
    </div>
  );
};

export default Sales;
