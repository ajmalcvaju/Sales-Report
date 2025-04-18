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

export const getCustomerData = () => {
  return axios.get(`${BASE_URL}/customer`);
};

