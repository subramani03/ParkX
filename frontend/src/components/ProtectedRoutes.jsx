import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { BASE_URL } from "../Utils/constants";

const ProtectedRoutes = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/checkAuth`, {
          withCredentials: true,
        });

        setIsAuthenticated(res.data.authenticated === true);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []); // ✅ run ONCE

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
