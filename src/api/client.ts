import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5002",
  headers: { "Content-Type": "application/json" },
});
