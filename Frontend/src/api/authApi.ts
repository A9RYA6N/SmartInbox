import { axiosClient } from "./axiosClient";

export const loginUser = async (credentials: any) => {
  const { data } = await axiosClient.post("/auth/user/login", credentials);
  return data;
};

export const registerUser = async (userData: any) => {
  const { data } = await axiosClient.post("/auth/user/register", userData);
  return data;
};

export const getMe = async () => {
  const { data } = await axiosClient.get("/auth/user/me");
  return data;
};

export const loginAdmin = async (credentials: any) => {
  const { data } = await axiosClient.post("/auth/admin/login", credentials);
  return data;
};

export const registerAdmin = async (adminData: any) => {
  const { data } = await axiosClient.post("/auth/admin/register", adminData);
  return data;
};

export const getAdminMe = async () => {
  const { data } = await axiosClient.get("/auth/admin/me");
  return data;
};
