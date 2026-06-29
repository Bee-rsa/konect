import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const getConfig = () => {
  const token = localStorage.getItem("companyUserToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createCompanyUser = async (payload) => {
  const response = await axios.post(`${API}/api/company-users`, payload, getConfig());
  return response.data;
};

export const fetchCompanyUsers = async () => {
  const response = await axios.get(`${API}/api/company-users`, getConfig());
  return response.data;
};

export const fetchRecentActivity = async () => {
  const response = await axios.get(`${API}/api/company-users/recent-activity`, getConfig());
  return response.data;
};