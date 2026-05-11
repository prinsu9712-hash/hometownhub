import axios from "axios";

const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");
const AUTH_EVENT_NAME = "auth:expired";
const AUTH_MESSAGE_STORAGE_KEY = "auth:message";

const normalizeApiBaseUrl = (value) => {
  const normalized = stripTrailingSlash(value);

  if (!normalized) {
    return "/api";
  }

  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const configuredApiUrl =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://hometown-hub-backend.onrender.com");

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiUrl);
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
export const AUTH_EXPIRED_EVENT = AUTH_EVENT_NAME;

const API = axios.create({
  baseURL: API_BASE_URL
});

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearStoredAuth();

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            AUTH_MESSAGE_STORAGE_KEY,
            "Session expired. Please log in again."
          );
        } catch (storageError) {
          // Ignore storage failures and still redirect the user to login.
        }

        window.dispatchEvent(
          new CustomEvent(AUTH_EVENT_NAME, {
            detail: {
              message: "Session expired. Please log in again."
            }
          })
        );

        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallback = "Request failed.") => {
  if (error?.message === "Network Error") {
    return `Cannot reach the backend at ${API_BASE_URL}. Make sure your backend is deployed and CORS allows this Vercel domain.`;
  }

  if (error?.response?.status === 401) {
    return "Session expired. Please log in again.";
  }

  if (error?.response?.status === 429) {
    return error?.response?.data?.message || "Too many requests. Please wait a minute and try again.";
  }

  return error?.response?.data?.message || error?.response?.data?.error || fallback;
};

export const getUploadUrl = (filePath) => {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const normalizedPath = String(filePath)
    .replace(/^\/+/, "")
    .replace(/^uploads\/+/i, "");
  return `${API_ORIGIN}/uploads/${normalizedPath}`;
};

export default API;
