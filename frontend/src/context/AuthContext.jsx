import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { setToken as setAxiosToken } from "../api/authTokenHelper";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData, authToken, userRole) => {
    setUser(userData);
    setToken(authToken);
    setRole(userRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
  };

  useEffect(() => {
    const authToken = Cookies.get("authToken");
    const userRole = Cookies.get("userRole");
    const userData = Cookies.get("userData");

    if (authToken && userRole && userData) {
      setUser(JSON.parse(userData));
      setToken(authToken);
      setRole(userRole);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (token && user && role) {
      Cookies.set("authToken", token, { expires: 7 });
      Cookies.set("userRole", role, { expires: 7 });
      Cookies.set("userData", JSON.stringify(user), { expires: 7 });
      setAxiosToken(token);
    } else {
      Cookies.remove("authToken");
      Cookies.remove("userRole");
      Cookies.remove("userData");
      setAxiosToken(null);
    }
  }, [token, user, role]);

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
