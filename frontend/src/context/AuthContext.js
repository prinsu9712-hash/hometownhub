import { createContext, useState, useEffect } from "react";
import API, { AUTH_EXPIRED_EVENT, getApiErrorMessage } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const clearAuthState = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    };

    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (!storedUser || !storedToken) {
          clearAuthState();
          return;
        }

        const { data } = await API.get("/auth/me");
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      } catch (error) {
        clearAuthState();
      } finally {
        setIsAuthReady(true);
      }
    };

    const handleExpiredAuth = () => {
      clearAuthState();
      setIsAuthReady(true);
    };

    initializeAuth();
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const payload = {
        email: (credentials.email || "").trim().toLowerCase(),
        password: credentials.password || "",
      };

      const { data } = await API.post("/auth/login", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      const message = getApiErrorMessage(error, "Login failed");
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data } = await API.get("/auth/me");
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await API.put("/auth/me", payload);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateProfilePhoto = async (file) => {
    const payload = new FormData();
    payload.append("profilePhoto", file);

    const { data } = await API.put("/auth/me/photo", payload, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthReady, refreshProfile, updateProfile, updateProfilePhoto }}
    >
      {children}
    </AuthContext.Provider>
  );
};
