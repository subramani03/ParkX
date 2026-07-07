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

  console.log(rows)

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const sendToWhatsApp = () => {
    if (!billData) return;

    const phoneWithCountry = `91${billData.phone}`;
    
    const message = `🅿️ *ParkX PARKING TICKET*
━━━━━━━━━━━━━━━━━━

🚗 *Vehicle:* ${billData.vehicleNumber}
📍 *Slot:* ${billData.slotNumber}
📞 *Phone:* ${billData.phone}

🕐 *Entry Time:*
${formatDateTime(billData.entryTime)}

━━━━━━━━━━━━━━━━━━
📌 *Instructions:*
• Keep this ticket safe
• Show QR code at exit gate
• Charges: ₹20/day

Thank you for choosing ParkX! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
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
                  <p className="text-xs font-medium text-center">{formatDateTime(billData.entryTime)}</p>
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

            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors"
                onClick={downloadBill}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#128C7E] transition-colors shadow-lg shadow-[#25D366]/20"
                onClick={sendToWhatsApp}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
