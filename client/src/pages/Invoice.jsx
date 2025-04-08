import React from "react";

const Invoice = ({ sale, products, onClose }) => {
  const getProductDetails = (productId) =>
    products.find((p) => p._id === productId) || {};

  const totalPricePerItem = (item) => {
    const product = getProductDetails(item.productId);
    return item.quantity * (product.price || 0);
  };

  const grandTotal = sale.items.reduce(
    (sum, item) => sum + totalPricePerItem(item),
    0
  );

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-center mb-4">Invoice</h2>
        <div className="flex justify-between mb-4">
          <div>
            <p className="font-semibold">Customer:</p>
            <p>{sale.customerName}</p>
          </div>
          <div>
            <p className="font-semibold">Date:</p>
            <p>{sale.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 font-semibold border-y py-2">
          <div>Item</div>
          <div>Qty</div>
          <div>Price</div>
          <div>Total</div>
        </div>

        {sale.items.map((item) => {
          const product = getProductDetails(item.productId);
          return (
            <div
              key={item._id}
              className="grid grid-cols-4 border-b py-2 text-sm"
            >
              <div>{product.name}</div>
              <div>{item.quantity}</div>
              <div>₹{product.price}</div>
              <div>₹{totalPricePerItem(item)}</div>
            </div>
          );
        })}

        <div className="text-right font-bold text-lg mt-4">
          Grand Total: ₹{grandTotal}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
