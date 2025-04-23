import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const getSalesData = () => {
  return axios.get(`${BASE_URL}/products/sales`);
};

export const getPurchaseData = () => {
  return axios.get(`${BASE_URL}/products/purchase`);
};

export const getProductData = () => {
  return axios.get(`${BASE_URL}/products`);
};

export const fetchAllProductData = () => {
  return Promise.all([getSalesData(), getPurchaseData(), getProductData()]);
};

export const fetchProduct = async () => {
  const res = await axios.get(`${BASE_URL}/products`);
  return res.data;
};

export const getProducts = async () => {
  const res = await axios.get(`${BASE_URL}/products`);
  return res.data;
};

export const getCustomers = async () => {
  const res = await axios.get(`${BASE_URL}/customer`);
  return res.data;
};

export const updateProduct = async (editProductId, formData) => {
  const res = await axios.patch(`${BASE_URL}/products/update-product/${editProductId}`, formData);
  return res.data;
};

export const createProduct = async (formData) => {
  const res = await axios.post(`${BASE_URL}/products/create-product`, formData);
  return res.data;
};
export const deleteProduct = async (id) => {
  await axios.delete(`${BASE_URL}/products/delete-product/${id}`);
};

export const applySale = async (saleData) => {
  const res = await axios.patch(`${BASE_URL}/products/sale`, saleData);
  return res.data;
};

export const applyPurchase = async (saleData) => {
  const res = await axios.patch(`${BASE_URL}/products/purchase`, saleData);
  return res.data;
};

export const fetchCustomers = async () => {
  const res = await axios.get(`${BASE_URL}/customer`);
  return res.data;
};

export const updateCustomer = async (editUserId, formData) => {
  const res = await axios.patch(
    `${BASE_URL}/customer/update-customer/${editUserId}`,
    formData
  );
  return res.data;
};

export const createCustomer = async (formData) => {
  const res = await axios.post(
    `${BASE_URL}/customer/create-customer`,
    formData
  );
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await axios.delete(
    `${BASE_URL}/customer/delete-customer/${id}`
  );
  return res.data;
};
