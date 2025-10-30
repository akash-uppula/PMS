import axios from "axios";
import { getToken, setToken as setAxiosToken } from "./authTokenHelper";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("authToken");
      Cookies.remove("userRole");
      Cookies.remove("userData");
      setAxiosToken(null);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
