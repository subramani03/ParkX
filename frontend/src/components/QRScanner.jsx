import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Camera, ShieldCheck, RefreshCw, Image as ImageIcon, Zap, X, Car, Clock, Wallet, Phone, MapPin } from "lucide-react";
import { BASE_URL } from "../Utils/constants";


const API = `${BASE_URL}/api/parking`;

export default function QRScanner() {
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);
  const [status, setStatus] = useState("scanning");
  const [lastScanned, setLastScanned] = useState(null);
  const [scanMethod, setScanMethod] = useState("camera");
  const [billData, setBillData] = useState(null);

  useEffect(() => {
    if (scanMethod === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scanMethod]);

  const startCamera = async () => {
    try {
      // Ensure any existing instance is cleared
      if (html5QrCodeRef.current) { await stopCamera(); }
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;
      setStatus("scanning");

      await html5QrCode.start(
        { facingMode: "environment" },
        { 
          fps: 20, 
          // Center the box precisely
          qrbox: (viewWidth, viewHeight) => {
            const size = Math.min(viewWidth, viewHeight) * 0.7;
            return { width: size, height: size };
          } 
        },
        onScanSuccess
      );
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("error");
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop();
    }
  };

  const onScanSuccess = async (decodedText) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setStatus("processing");

    try {
      const match = decodedText.match(/[A-Z]\d+/i);
      if (!match) throw new Error("Format Mismatch");

      const slotNumber = match[0].toUpperCase();
      setLastScanned(slotNumber);

      const res = await axios.post(`${API}/release`, { slotNumber });
      setBillData(res.data.bill);
      toast.success(`DEPARTURE: ${slotNumber}`);
      setStatus("success");

      await stopCamera();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Invalid Token");
      setStatus("scanning");
      isProcessingRef.current = false;
    }
  };

  const closeBillPopup = () => {
    setBillData(null);
    setLastScanned(null);
    setStatus("scanning");
    isProcessingRef.current = false;
    if (scanMethod === "camera") {
      startCamera();
    }
  };

  const goToHome = () => {
    window.location.href = "/";
  };

  const formatDateTime = (date) => {
    if (!date) return "---";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "---";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ${hours % 24}h`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 pt-24 flex flex-col items-center">
      {/* 🔹 CSS Override to fix alignment and hide library junk */}
      <style>{`
        #qr-reader { border: none !important; width: 100% !important; }
        #qr-reader video { 
            object-fit: cover !important; 
            border-radius: 2rem !important;
            width: 100% !important;
            height: 100% !important;
        }
        #qr-reader__scan_region { display: flex; justify-content: center; align-items: center; }
        #qr-reader img { display: none; } /* Hide the default scan-image icon */
      `}</style>

      <ToastContainer position="top-center" theme="dark" />

      {/* HEADER */}
      <div className="w-full max-w-md text-center mb-6">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
          Park<span className="text-indigo-500 font-black">X</span> Gate
        </h2>
        
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 mt-6 w-72 mx-auto backdrop-blur-sm">
          <button 
            onClick={() => setScanMethod("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${scanMethod === 'camera' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
          >
            <Zap size={14} /> LIVE CAMERA
          </button>
          <button 
            onClick={() => setScanMethod("file")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all ${scanMethod === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
          >
            <ImageIcon size={14} /> FILE UPLOAD
          </button>
        </div>
      </div>

      {/* SCANNER VIEWPORT */}
      <div className="relative w-full max-w-[340px] aspect-square bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-indigo-500/10">
        
        {scanMethod === "camera" ? (
          <div id="qr-reader" className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
              <ImageIcon className="text-indigo-400" size={30} />
            </div>
            <label className="bg-white text-black text-[11px] font-black py-3 px-8 rounded-xl cursor-pointer hover:bg-slate-200 transition-all uppercase tracking-widest">
              Pick Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const html5QrCode = new Html5Qrcode("qr-reader-hidden");
                  html5QrCode.scanFile(file, true).then(onScanSuccess).catch(() => toast.error("No QR found"));
                }
              }} />
            </label>
          </div>
        )}

        {/* Status Overlays */}
        {status === "processing" && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
            <p className="text-[10px] font-black tracking-[0.3em] text-indigo-400">ANALYZING SIGNAL</p>
          </div>
        )}

        {status === "success" && !billData && (lastScanned &&
          <div className="absolute inset-0 z-30 bg-emerald-600 flex flex-col items-center justify-center animate-in zoom-in-95">
            <ShieldCheck className="w-16 h-16 text-white mb-2" />
            <h3 className="text-2xl font-black text-white">{lastScanned}</h3>
            <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">Departure Cleared</p>
          </div>
        )}

        {/* Scan Frame Overlay (Aesthetic Only) */}
        <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-900/20 z-10"></div>
        <div className="absolute top-10 left-10 w-10 h-10 border-t-2 border-l-2 border-indigo-500/50 z-20"></div>
        <div className="absolute top-10 right-10 w-10 h-10 border-t-2 border-r-2 border-indigo-500/50 z-20"></div>
        <div className="absolute bottom-10 left-10 w-10 h-10 border-b-2 border-l-2 border-indigo-500/50 z-20"></div>
        <div className="absolute bottom-10 right-10 w-10 h-10 border-b-2 border-r-2 border-indigo-500/50 z-20"></div>
      </div>

      <div id="qr-reader-hidden" className="hidden" />

      {/* FOOTER INFO */}
      <p className="mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] text-center max-w-[250px] leading-relaxed">
        System active: {scanMethod === 'camera' ? 'Video Sync Operational' : 'Ready for Image Input'}
      </p>

      {/* BILL POPUP MODAL */}
      {billData && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-[400px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="bg-emerald-600 p-6 text-center relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={closeBillPopup}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <ShieldCheck className="w-12 h-12 text-white mx-auto mb-2" />
              <h3 className="text-xl font-black text-white uppercase tracking-wide">Departure Cleared</h3>
              <p className="text-[10px] text-white/80 uppercase tracking-widest mt-1">Slot {billData.slotNumber} Released</p>
            </div>

            {/* Bill Details */}
            <div className="p-6 space-y-4">
              
              {/* Vehicle Info */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-600/20 rounded-xl">
                    <Car className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vehicle Number</p>
                    <p className="text-lg font-black text-white uppercase">{billData.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-300 font-mono">{billData.phone}</p>
                </div>
              </div>

              {/* Time Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Entry</p>
                  </div>
                  <p className="text-xs font-bold text-white">{formatDateTime(billData.entryTime)}</p>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Exit</p>
                  </div>
                  <p className="text-xs font-bold text-white">{formatDateTime(billData.exitTime)}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600/20 rounded-xl">
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Duration</p>
                    <p className="text-sm font-bold text-white">{formatDuration(billData.durationMinutes)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Slot</p>
                  <p className="text-lg font-black text-indigo-400">{billData.slotNumber}</p>
                </div>
              </div>

              {/* Amount to Collect */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold">Amount to Collect</p>
                </div>
                <p className="text-4xl font-black text-white">₹{billData.amount || 0}</p>
              </div>

            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={closeBillPopup}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all text-sm uppercase tracking-widest"
              >
                Scan Next
              </button>
              <button
                onClick={goToHome}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all text-sm uppercase tracking-widest shadow-lg shadow-emerald-600/20"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}