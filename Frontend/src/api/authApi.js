import { axiosClient } from "./axiosClient";

// ── User Auth ─────────────────────────────────────────────────────────────────

export const loginUser = async (credentials) => {
  const { data } = await axiosClient.post("/auth/user/login", credentials);
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await axiosClient.post("/auth/user/register", userData);
  return data;
};

export const getMe = async () => {
  const { data } = await axiosClient.get("/auth/user/me");
  return data;
};

// ── Admin Auth ────────────────────────────────────────────────────────────────

export const loginAdmin = async (credentials) => {
  const { data } = await axiosClient.post("/auth/admin/login", credentials);
  return data;
};

export const registerAdmin = async (adminData) => {
  const { data } = await axiosClient.post("/auth/admin/register", adminData);
  return data;
};

export const getAdminMe = async () => {
  const { data } = await axiosClient.get("/auth/admin/me");
  return data;
};

export const refreshUserToken = async (refreshToken) => {
  const { data } = await axiosClient.post("/auth/user/refresh", { refresh_token: refreshToken });
  return data;
};

export const refreshAdminToken = async (refreshToken) => {
  const { data } = await axiosClient.post("/auth/admin/refresh", { refresh_token: refreshToken });
  return data;
};
