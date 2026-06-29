import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const loginCompanyUser = async (payload) => {
  const response = await axios.post(`${API}/api/company-auth/login`, payload);
  return response.data;
};