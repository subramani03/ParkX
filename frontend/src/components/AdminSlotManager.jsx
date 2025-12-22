import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2, Plus, RefreshCw, Layers, AlertOctagon } from "lucide-react";
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

      {/* COMPACT ADMIN HEADER */}
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-100">ADMIN <span className="text-indigo-500">PANEL</span></h2>
        </div>
        
        <div className="flex gap-2">
            <button onClick={load} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setAddRowModal(true)} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-indigo-600/20">
                <Plus size={14} /> NEW ZONE
            </button>
        </div>
      </header>

      {/* ZONE LIST */}
      <main className="max-w-5xl mx-auto space-y-4">
        {sortedRows.map((row) => (
          <section key={row} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-tighter border border-indigo-500/30">Zone {row}</span>
                <div className="h-px flex-1 bg-slate-800/50"></div>
            </div>

            {/* GRID: Reduced size squares like SlotGrid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {groupedSlots[row].sort((a,b) => a.slotNumber.localeCompare(b.slotNumber, undefined, {numeric: true})).map((s) => (
                <div key={s._id} className="relative group flex justify-center">
                  <button
                    onClick={() => { setSelectedSlot(s); setToggleModal(true); }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg text-[10px] font-bold transition-all border
                      ${s.isOccupied 
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-500" 
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"}`}
                  >
                    {s.slotNumber.replace(row, "")}
                  </button>

                  <button
                    onClick={() => { setSelectedSlot(s); setDeleteModal(true); }}
                    className="absolute -top-1.5 -right-1.5 hidden group-hover:flex bg-slate-950 border border-slate-700 text-rose-500 p-1 rounded-md shadow-xl hover:bg-rose-600 hover:text-white"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addSlotToRow(row)}
                className="w-10 h-10 sm:w-11 sm:h-11 border border-dashed border-slate-700 text-slate-600 hover:border-indigo-500 hover:text-indigo-500 rounded-lg flex items-center justify-center transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </section>
        ))}
      </main>

      {/* MINIMALIST MODALS */}
      {(addRowModal || toggleModal || deleteModal) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[200] p-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-[320px] shadow-2xl animate-in zoom-in-95 duration-200">
            
            {addRowModal ? (
              <>
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 text-center">Initialize New Zone</h3>
                <input
                  autoFocus
                  maxLength={1}
                  onChange={(e) => setNewRow(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 text-center text-xl font-black text-white focus:border-indigo-500 outline-none mb-4"
                  placeholder="A-Z"
                />
                <div className="flex gap-2">
                  <button onClick={() => setAddRowModal(false)} className="flex-1 py-2 text-xs font-bold text-slate-500">CANCEL</button>
                  <button onClick={createRow} className="flex-1 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white">CREATE</button>
                </div>
              </>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${deleteModal ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                    <AlertOctagon size={24} />
                </div>
                <h3 className="text-center font-bold text-sm mb-2">Slot {selectedSlot?.slotNumber}</h3>
                <p className="text-center text-slate-400 text-[11px] mb-6">
                    {deleteModal ? "Permanently delete this unit?" : "Toggle occupancy status?"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => {setToggleModal(false); setDeleteModal(false);}} className="flex-1 py-2 text-xs font-bold text-slate-500">ABORT</button>
                  <button 
                    onClick={deleteModal ? deleteSlot : toggleSlot} 
                    className={`flex-1 py-2 rounded-lg text-xs font-bold text-white ${deleteModal ? 'bg-rose-600' : 'bg-indigo-600'}`}
                  >
                    CONFIRM
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