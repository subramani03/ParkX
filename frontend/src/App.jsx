import { BrowserRouter, Routes, Route } from "react-router-dom";
import SlotGrid from "./components/SlotGrid";
import QRScanner from "./components/QRScanner";
import AdminSlotManager from "./components/AdminSlotManager";
import Body from "./components/Body";
import Login from "./components/Login";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { BASE_URL } from "./Utils/constants";



export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/analytics`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  console.log(data);
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED LAYOUT */}
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Body />
            </ProtectedRoutes>
          }
        >
          <Route index element={<SlotGrid />} />
          <Route path="qrscanner" element={<QRScanner />} />
          <Route path="slotmanager" element={<AdminSlotManager />} />
          <Route path="dashboard" element={<AnalyticsDashboard data={data} />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
