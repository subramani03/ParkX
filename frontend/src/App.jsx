import { BrowserRouter, Routes, Route } from "react-router-dom";
import SlotGrid from "./components/SlotGrid";
import QRScanner from "./components/QRScanner";
import AdminSlotManager from "./components/AdminSlotManager";
import Body from "./components/Body";
import Login from "./components/Login";
import ProtectedRoutes from "./components/ProtectedRoutes";

export default function App() {
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
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
