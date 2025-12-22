import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Camera, ShieldCheck, RefreshCw, Image as ImageIcon, Zap } from "lucide-react";
import { BASE_URL } from "../Utils/constants";


const API = `${BASE_URL}/api/parking`;

export default function QRScanner() {
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);
  const [status, setStatus] = useState("scanning");
  const [lastScanned, setLastScanned] = useState(null);
  const [scanMethod, setScanMethod] = useState("camera");

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

      await axios.post(`${API}/release`, { slotNumber });
      toast.success(`DEPARTURE: ${slotNumber}`);
      setStatus("success");

      await stopCamera();
      setTimeout(() => (window.location.href = "/"), 2000);
    } catch (err) {
      toast.error(err.message || "Invalid Token");
      setStatus("scanning");
      isProcessingRef.current = false;
    }
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

        {status === "success" && (lastScanned &&
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
    </div>
  );
}