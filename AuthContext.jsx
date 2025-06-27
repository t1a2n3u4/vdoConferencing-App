import React, { createContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || "http://localhost:6001";

  const login = async (inputs) => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, inputs);
      // Store backend user ID and token
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("userName", res.data.user.username);
      localStorage.setItem("userEmail", res.data.user.email);
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    }
  };

  const register = async (inputs) => {
    try {
      const res = await axios.post(`${API}/api/auth/register`, inputs);
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("userName", res.data.user.username);
      localStorage.setItem("userEmail", res.data.user.email);
      navigate("/");
    } catch (err) {
      console.error("Register failed:", err.response?.data || err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};