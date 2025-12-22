import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    BarChart3, Clock, Wallet, Car, TrendingUp,
    ArrowUpRight, Activity, History, Search,
    Download, ArrowDownRight, CalendarDays,
    Zap, Filter, CheckCircle2, Navigation,
    LogOut
} from 'lucide-react';

const AnalyticsDashboard = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all | parked | departed
    const [filterDate, setFilterDate] = useState("");
    const [selectedZone, setSelectedZone] = useState("all");

    // --- LOGIC: Advanced Multi-Filtering ---
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // 1. Vehicle Search
            const matchesSearch = item.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());

            // 2. Status Filter (Parked vs Departed)
            const isParked = !item.exitTime;
            const matchesStatus =
                filterStatus === "all" ? true :
                    filterStatus === "parked" ? isParked : !isParked;

            // 3. Date Filter
            const itemDate = new Date(item.entryTime).toISOString().split('T')[0];
            const matchesDate = filterDate === "" ? true : itemDate === filterDate;

            // 4. Zone Filter
            const matchesZone = selectedZone === "all" ? true : item.slotNumber?.startsWith(selectedZone);

            return matchesSearch && matchesStatus && matchesDate && matchesZone;
        });
    }, [data, searchTerm, filterStatus, filterDate, selectedZone]);

    // --- FEATURE: EXCEL EXPORT ---
    const exportToExcel = () => {
        if (filteredData.length === 0) return alert("No data to export");
        const fileData = filteredData.map(item => ({
            "Vehicle": item.vehicleNumber,
            "Phone": item.phone,
            "Slot": item.slotNumber,
            "Status": item.exitTime ? "Departed" : "Parked",
            "Entry": formatFullDate(item.entryTime),
            "Exit": formatFullDate(item.exitTime),
            "Duration": item.durationMinutes || 0,
            "Amount": item.amount || 0
        }));
        const ws = XLSX.utils.json_to_sheet(fileData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ParkX_Report");
        XLSX.writeFile(wb, `Parking_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const formatFullDate = (date) => {
        if (!date) return "---";
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const zones = useMemo(() => {
        const zoneSet = new Set();

        data.forEach(item => {
            if (item.slotNumber) {
                zoneSet.add(item.slotNumber.charAt(0)); // A, B, C, D, etc.
            }
        });

        return Array.from(zoneSet).sort();
    }, [data]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 pt-24 md:p-8 md:pt-28 font-sans">

            {/* HEADER & ANALYTICS FILTERS */}
            <header className="max-w-7xl mx-auto mb-10 space-y-6">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                            <BarChart3 className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">System <span className="text-indigo-500">Intelligence</span></h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Advanced Flow & Revenue Analytics</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 md:w-56 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400" />
                            <input
                                type="text"
                                placeholder="Vehicle ID..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-indigo-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                            {['all', 'parked', 'departed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${filterStatus === status ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <select
                            className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 text-[10px] font-black uppercase text-indigo-400 outline-none"
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                        >
                            <option value="all">Zones</option>
                            {["A", "B", "C", "D", "E"].map(z => <option key={z} value={z}>Zone {z}</option>)}
                        </select>

                        <input
                            type="date"
                            className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 text-[11px] font-bold text-slate-300 outline-none"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />

                        <button
                            onClick={exportToExcel}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all"
                        >
                            <Download size={14} /> EXCEL
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LOGS SECTION */}
                <section className="lg:col-span-2 bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-500" /> Transaction Timeline
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{filteredData.length} records found</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] text-slate-600 uppercase tracking-widest bg-slate-950/50">
                                    <th className="px-6 py-4 font-black">Identity</th>
                                    <th className="px-6 py-4 font-black">Slot</th>
                                    <th className="px-6 py-4 font-black">Movement</th>
                                    <th className="px-6 py-4 font-black text-right">Fee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filteredData.map((session) => (
                                    <tr key={session._id} className="group hover:bg-indigo-600/[0.03] transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-black text-white text-xs tracking-wider group-hover:text-indigo-400 transition-colors uppercase">{session.vehicleNumber}</span>
                                                <span className="text-[9px] text-slate-600 font-bold">{session.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="bg-slate-950 border border-slate-800 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{session.slotNumber}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium italic">
                                                    <Navigation size={10} className="text-emerald-500" /> {formatFullDate(session.entryTime)}
                                                </div>
                                                {session.exitTime ? (
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium italic">
                                                        <LogOut size={10} className="text-rose-500" /> {formatFullDate(session.exitTime)}
                                                        <span className="text-[9px] text-indigo-500 font-black not-italic ml-1">({session.durationMinutes}m)</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 ml-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">On-Site Now</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className={`font-black text-xs ${session.amount ? 'text-white' : 'text-slate-700'}`}>
                                                {session.amount ? `₹${session.amount}` : "---"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                                <History size={48} className="opacity-10 mb-4" />
                                <p className="text-sm italic">No records match your current filter parameters</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* SIDEBAR ANALYTICS */}
                <div className="space-y-8">
                    <section className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Zone Load</h3>
                            <TrendingUp className="text-indigo-500 w-4 h-4" />
                        </div>
                        <div className="space-y-6">
                            {zones.map(zone => {
                                const zoneData = data.filter(s => s.slotNumber?.startsWith(zone) && !s.exitTime).length;
                                const percentage = zoneData * 10; // Simple calculation for 10 slots
                                return (
                                    <div key={zone} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-500">Zone {zone}</span>
                                            <span className="text-white">{percentage}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                            <div className={`h-full ${percentage > 80 ? 'bg-rose-500' : 'bg-indigo-500'} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                        <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/20 pb-2">Admin Summary</h4>
                        <div className="space-y-4">
                            <SummaryItem label="Filtered Revenue" value={`₹${filteredData.reduce((acc, s) => acc + (s.amount || 0), 0)}`} />
                            <SummaryItem label="Avg. Stay" value={`${Math.round(filteredData.filter(s => s.exitTime).reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / (filteredData.filter(s => s.exitTime).length || 1))} mins`} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const SummaryItem = ({ label, value }) => (
    <div className="flex justify-between items-end border-b border-white/10 pb-2">
        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{label}</span>
        <span className="text-lg font-black text-white leading-none">{value}</span>
    </div>
);

export default AnalyticsDashboard;