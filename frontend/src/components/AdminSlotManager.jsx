import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Plus, RefreshCw, Layers, AlertOctagon, Car } from "lucide-react";
import { BASE_URL } from "../Utils/constants";

const API = `${BASE_URL}/api/slots`;

export default function AdminSlotManager() {
  const [slots, setSlots] = useState([]);
  const [addRowModal, setAddRowModal] = useState(false);
  const [newRow, setNewRow] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [toggleModal, setToggleModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setSlots(res.data);
    } catch {
      toast.error("Cloud Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.row]) acc[slot.row] = [];
    acc[slot.row].push(slot);
    return acc;
  }, {});
  const sortedRows = Object.keys(groupedSlots).sort();

  const addSlotToRow = async (row) => {
    const rowSlots = groupedSlots[row];
    const lastNum = rowSlots.length > 0
        ? Math.max(...rowSlots.map(s => parseInt(s.slotNumber.replace(row, "")) || 0))
        : 0;
    const nextSlot = `${row}${lastNum + 1}`;
    try {
      await axios.post(`${API}/add`, { slotNumbers: [nextSlot] });
      toast.success(`Unit ${nextSlot} Online`);
      load();
    } catch { toast.error("Provisioning failed"); }
  };

  const createRow = async () => {
    const cleanRow = newRow.trim().toUpperCase();
    if (!cleanRow.match(/^[A-Z]$/)) {
      toast.error("Select A-Z");
      return;
    }
    try {
      await axios.post(`${API}/add`, { slotNumbers: [`${cleanRow}1`] });
      setNewRow("");
      setAddRowModal(false);
      load();
    } catch { toast.error("Zone creation failed"); }
  };

  const toggleSlot = async () => {
    try {
      await axios.put(`${API}/toggle/${selectedSlot._id}`);
      setToggleModal(false);
      load();
    } catch { toast.error("Update failed"); }
  };

  const deleteSlot = async () => {
    try {
      await axios.delete(`${API}/${selectedSlot._id}`);
      setDeleteModal(false);
      load();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-3 pt-24 md:p-8 md:pt-28 font-sans">
      <ToastContainer theme="dark" position="top-center" autoClose={1500} />

      {/* ADMIN HEADER */}
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-100">ADMIN <span className="text-indigo-500">CONTROL</span></h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Slot Management</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button onClick={load} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 transition-colors">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setAddRowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                <Plus size={16} /> NEW ZONE
            </button>
        </div>
      </header>

      {/* ZONE LIST */}
      <main className="max-w-5xl mx-auto space-y-6">
        {sortedRows.map((row) => (
          <section key={row} className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-black bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-lg uppercase tracking-tighter border border-indigo-500/20">Zone {row}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-800/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {groupedSlots[row].sort((a,b) => a.slotNumber.localeCompare(b.slotNumber, undefined, {numeric: true})).map((s) => (
                <div key={s._id} className="relative group flex justify-center">
                  
                  {/* HOVER TOOLTIP - VEHICLE NUMBER */}
                  {s.isOccupied && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 whitespace-nowrap flex items-center gap-2 scale-90 group-hover:scale-100">
                        <Car size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-mono font-bold text-white tracking-wider">{s.vehicleNumber || "UNKNOWN"}</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-slate-800 rotate-45"></div>
                    </div>
                  )}

                  <button
                    onClick={() => { setSelectedSlot(s); setToggleModal(true); }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-xs font-black transition-all border-2 relative overflow-hidden
                      ${s.isOccupied 
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/20"}`}
                  >
                    {s.slotNumber.replace(row, "")}
                    {s.isOccupied && (
                        <span className="absolute bottom-1 right-1 flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                        </span>
                    )}
                  </button>

                  {/* DELETE ICON - Only visible if slot is NOT occupied for safety */}
                  {!s.isOccupied && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedSlot(s); setDeleteModal(true); }}
                        className="absolute -top-1 -right-1 hidden group-hover:flex bg-slate-950 border border-slate-700 text-rose-500 p-1.5 rounded-lg shadow-xl hover:bg-rose-600 hover:text-white transition-colors z-10"
                    >
                        <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => addSlotToRow(row)}
                className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-dashed border-slate-800 text-slate-600 hover:border-indigo-500 hover:text-indigo-500 rounded-2xl flex items-center justify-center transition-all bg-slate-900/20"
              >
                <Plus size={20} />
              </button>
            </div>
          </section>
        ))}
      </main>

      {/* MODALS */}
      {(addRowModal || toggleModal || deleteModal) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[200] p-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-[350px] shadow-2xl animate-in zoom-in-95 duration-200">
            {addRowModal ? (
              <>
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 text-center">New Zone</h3>
                <input
                  autoFocus
                  maxLength={1}
                  onChange={(e) => setNewRow(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 text-center text-2xl font-black text-white focus:border-indigo-500 outline-none mb-6"
                  placeholder="A"
                />
                <div className="flex gap-3">
                  <button onClick={() => setAddRowModal(false)} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-800 rounded-xl transition-all uppercase">Cancel</button>
                  <button onClick={createRow} className="flex-1 py-3 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-500 transition-all uppercase">Create</button>
                </div>
              </>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${deleteModal ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    <AlertOctagon size={32} />
                </div>
                <h3 className="text-center font-black text-lg mb-2 text-white">UNIT {selectedSlot?.slotNumber}</h3>
                <p className="text-center text-slate-400 text-xs mb-8 leading-relaxed">
                    {deleteModal ? "This unit will be permanently decommissioned from the system database." : "You are about to manually override the occupancy state of this parking unit."}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => {setToggleModal(false); setDeleteModal(false);}} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-800 rounded-xl transition-all uppercase tracking-widest">Abort</button>
                  <button 
                    onClick={deleteModal ? deleteSlot : toggleSlot} 
                    className={`flex-1 py-3 rounded-xl text-xs font-bold text-white transition-all uppercase tracking-widest ${deleteModal ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}