import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toPng } from "html-to-image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../Utils/constants";


const API = `${BASE_URL}/api/parking`;

export default function SlotGrid() {
  const [slots, setSlots] = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [billData, setBillData] = useState(null);
  const [qrImage, setQrImage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const billRef = useRef(null);

  // Live Clock Feature
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = () => {
    axios
      .get(`${API}/slots`)
      .then((res) => setSlots(res.data))
      .catch(() => toast.error("Failed to load slots"));
  };

  const downloadBill = async () => {
    if (!billRef.current) return;
    try {
      const dataUrl = await toPng(billRef.current, {
        cacheBust: true,
        pixelRatio: 3, // Higher quality for mobile viewing
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Bill-${billData.vehicleNumber}.png`;
      link.click();
      toast.success("Saved to Gallery");
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const parkVehicle = async () => {
    if (!vehicleNumber || !phone || !selectedSlot) {
      toast.warning("Incomplete details");
      return;
    }
    try {
      const res = await axios.post(`${API}/park`, {
        vehicleNumber,
        phone,
        slotNumber: selectedSlot,
      });
      setBillData(res.data.bill);
      setQrImage(res.data.qrImage);
      toast.success("Booking Confirmed!");
      // Reset form
      setVehicleNumber("");
      setPhone("");
      setSelectedSlot("");
      fetchSlots(); // Refresh grid
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  // Grouping slots by Row
  const rows = slots.reduce((acc, slot) => {
    const row = String(slot.slotNumber).charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(slot);
    return acc;
  }, {});

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 pt-24 md:pt-28 font-sans">
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />

      {/* Header & Live Clock */}
      <header className="max-w-4xl mx-auto flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-indigo-400">ParkX<span className="text-xs font-normal text-slate-500">v1.0</span></h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Smart Management</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono text-indigo-300">{currentTime.toLocaleTimeString()}</p>
          <p className="text-[10px] text-slate-500 uppercase">{currentTime.toDateString()}</p>
        </div>
      </header>

      {/* Status Legend - More Compact */}
      <div className="flex justify-center gap-4 mb-8">
        {[
          { label: "Free", color: "bg-emerald-500" },
          { label: "Booked", color: "bg-rose-500" },
          { label: "Select", color: "bg-amber-400" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* SLOT GRID - Responsive Sizing */}
      <main className="max-w-4xl mx-auto space-y-8">
        {Object.keys(rows).sort().map((row) => (
          <section key={row} className="relative border border-slate-800/50 p-4 rounded-2xl bg-slate-900/30">
            <span className="absolute -top-3 left-4 bg-[#020617] px-2 text-xs font-bold text-indigo-400 uppercase">Zone {row}</span>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 justify-items-center">
              {rows[row].map((slot) => {
                const slotNum = String(slot.slotNumber).slice(1);
                const isSelected = selectedSlot === slot.slotNumber;
                return (
                  <button
                    key={slot._id}
                    disabled={slot.isOccupied}
                    onClick={() => setSelectedSlot(slot.slotNumber)}
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xs font-bold transition-all duration-300
                      flex items-center justify-center
                      ${slot.isOccupied 
                        ? "bg-rose-500/10 border-rose-500/30  text-white cursor-not-allowed border " 
                        : isSelected
                        ? "bg-amber-400 text-black ring-4 ring-amber-400/20 animate-pulse scale-105"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white"}
                    `}
                  >
                    {slotNum}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* BOOKING FORM - Modern Inputs */}
        <section className="max-w-md mx-auto bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-center text-sm font-semibold mb-4 text-slate-400 uppercase tracking-widest">Entry Registration</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="VEHICLE NO (e.g. MH01AB1234)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors uppercase"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
            <input
              type="tel"
              placeholder="PHONE NUMBER"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={parkVehicle}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              Confirm Booking {selectedSlot && `(${selectedSlot})`}
            </button>
          </div>
        </section>

        {/* DIGITAL RECEIPT */}
        {billData && (
          <section className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div ref={billRef} className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-indigo-600 p-4 text-white text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-80">Official Entry Pass</p>
                <h3 className="text-xl font-black">ParkX SYSTEMS</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between border-b border-dashed border-slate-300 pb-2">
                  <span className="text-slate-500 text-xs uppercase font-bold">Slot</span>
                  <span className="font-mono font-bold text-lg text-indigo-600">{billData.slotNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Vehicle</p>
                    <p className="font-bold text-sm">{billData.vehicleNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Phone</p>
                    <p className="font-bold text-sm">{billData.phone}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 uppercase font-bold text-center">Entry Timestamp</p>
                  <p className="text-xs font-medium text-center">{formatDateTime(billData.exitTime)}</p>
                </div>

                {qrImage && (
                  <div className="flex flex-col items-center pt-4 border-t border-slate-100">
                    <img src={qrImage} alt="QR" className="w-32 h-32" />
                    <p className="text-[9px] text-slate-400 mt-2 uppercase">Scan at exit for checkout</p>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 p-3 text-center">
                <p className="text-[10px] text-slate-400 italic">Thank you for parking with us!</p>
              </div>
            </div>

            <button
              className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors"
              onClick={downloadBill}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save Receipt to Phone
            </button>
          </section>
        )}
      </main>

    </div>
  );
}
