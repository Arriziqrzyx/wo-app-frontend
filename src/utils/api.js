import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // tetap false karena pakai localStorage
});

// console.log("🛰️ API baseURL:", import.meta.env.VITE_API_URL);

// Tambahkan interceptor request untuk attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tambahkan interceptor response untuk handle token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.message?.toLowerCase().includes("token expired")
    ) {
      // Hapus token dari localStorage
      localStorage.removeItem("token");

      // Redirect user ke login
      window.location.href = "/login";

      // Reject error asli supaya thunk masih bisa handle message
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;
