import axios from "axios";

// Determine the backend URL based on environment
const getBackendUrl = (): string => {
  // For production (Azure deployment), use the production backend URL
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://deviation-back.azurewebsites.net";
  }
  
  // For local development, use the environment variable or localhost
  return import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5002";
};

export const api = axios.create({
  baseURL: getBackendUrl(),
  headers: { "Content-Type": "application/json" },
});
