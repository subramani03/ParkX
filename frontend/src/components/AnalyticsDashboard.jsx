import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    BarChart3, Wallet, Car, TrendingUp,
    Activity, History, Search,
    Download, Navigation,
    LogOut, Zap, ChevronLeft, ChevronRight,
    RefreshCw, Clock, AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../Utils/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

/* ---------------------- STAT CARD ---------------------- */
const StatCard = ({ title, value, icon, color, trend }) => {
    const colorMap = {
        indigo: 'bg-indigo-600/20 text-indigo-400',
        emerald: 'bg-emerald-600/20 text-emerald-400',
        blue: 'bg-blue-600/20 text-blue-400',
        amber: 'bg-amber-600/20 text-amber-400'
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-5 shadow-xl transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{trend}</span>
                )}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                {title}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
                {value}
            </h3>
        </div>
    );
};

const API = `${BASE_URL}/api/slots`;

/* ---------------------- MAIN DASHBOARD ---------------------- */
const AnalyticsDashboard = ({ data = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("");
    const [selectedZone, setSelectedZone] = useState("all");
    const [slots, setSlots] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;

    /* ---------------- DATA SYNC ---------------- */
    const load = async (silent = false) => {
        if (!silent) setIsSyncing(true);
        try {
            const res = await axios.get(API);
            setSlots(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            if (!silent) toast.error("Cloud Sync Failed");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => { 
        load(); 
        const interval = setInterval(() => load(true), 30000);
        return () => clearInterval(interval);
    }, []);

    /* ---------------- FILTER LOGIC ---------------- */
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const isParked = !item.exitTime;
            const matchesStatus = filterStatus === "all" ? true : filterStatus === "parked" ? isParked : !isParked;
            
            let itemDate = "";
            try {
                itemDate = item.entryTime ? new Date(item.entryTime).toISOString().split("T")[0] : "";
            } catch (e) { itemDate = ""; }

            const matchesDate = filterDate === "" ? true : itemDate === filterDate;
            const matchesZone = selectedZone === "all" ? true : item.slotNumber?.startsWith(selectedZone);

            return matchesSearch && matchesStatus && matchesDate && matchesZone;
        });
    }, [data, searchTerm, filterStatus, filterDate, selectedZone]);

    // Pagination Safety: Reset to page 1 if current page is out of bounds
    const totalPages = Math.max(1, Math.ceil(filteredData.length / recordsPerPage));
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [filteredData.length, totalPages, currentPage]);

    /* ---------------- ADVANCED ANALYTICS ---------------- */
    const intelligence = useMemo(() => {
        if (data.length === 0) return { peakHour: "N/A", avgTicket: 0 };

        // 1. Peak Hour Detection
        const hourCounts = data.reduce((acc, i) => {
            const date = new Date(i.entryTime);
            if (!isNaN(date.getTime())) {
                const hr = date.getHours();
                acc[hr] = (acc[hr] || 0) + 1;
            }
            return acc;
        }, {});
        
        const peakHour = Object.keys(hourCounts).length > 0 
            ? Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b) 
            : "N/A";

        // 2. Average Ticket Value
        const totalRevenue = data.reduce((acc, s) => acc + (s.amount || 0), 0);
        const completed = data.filter(s => s.exitTime).length;
        const avgTicket = completed > 0 ? Math.round(totalRevenue / completed) : 0;

        return { peakHour, avgTicket };
    }, [data]);

    /* ---------------- STATS ---------------- */
    const stats = useMemo(() => {
        const totalRevenue = filteredData.reduce((acc, s) => acc + (s.amount || 0), 0);
        const activeParked = filteredData.filter(s => !s.exitTime).length;
        const totalUnits = filteredData.length;
        const capacity = slots.length > 0 ? slots.length : 50;
        const systemLoad = Math.round((activeParked / capacity) * 100);

        return { totalRevenue, activeParked, totalUnits, systemLoad };
    }, [filteredData, slots]);

    const zones = useMemo(() => {
        const set = new Set();
        data.forEach(i => i.slotNumber && set.add(i.slotNumber[0]));
        return Array.from(set).sort();
    }, [data]);

    /* ---------------- HELPERS ---------------- */
    const formatFullDate = (date) => {
        if (!date) return "---";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "---" : d.toLocaleString("en-IN", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true
        });
    };


    const formatParkingDuration = (entryTime, exitTime) => {
    if (!entryTime) return "---";

    const start = new Date(entryTime).getTime();
    const end = exitTime ? new Date(exitTime).getTime() : Date.now();

    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs <= 0) return "0 min";

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} hr`;
    if (days < 30) return `${days} day${days > 1 ? "s" : ""}`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;

    return `${years} year${years > 1 ? "s" : ""}`;
};


    const exportToExcel = () => {
        if (!filteredData.length) return toast.info("No data to export");
        const fileData = filteredData.map(item => ({
            Vehicle: item.vehicleNumber, Phone: item.phone, Slot: item.slotNumber,
            Status: item.exitTime ? "Departed" : "Parked", Entry: formatFullDate(item.entryTime),
            Exit: formatFullDate(item.exitTime), Amount: item.amount || 0
        }));
        const ws = XLSX.utils.json_to_sheet(fileData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ParkX_Report");
        XLSX.writeFile(wb, `Parking_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    const indexOfFirstRecord = (currentPage - 1) * recordsPerPage;
    const indexOfLastRecord = indexOfFirstRecord + recordsPerPage;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 pt-24 md:p-8 md:pt-28 font-sans">
            
            <header className="max-w-7xl mx-auto mb-10 space-y-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg relative">
                            <BarChart3 className="text-white w-6 h-6" />
                            {isSyncing && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative rounded-full h-3 w-3 bg-emerald-500"></span></span>}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">System <span className="text-indigo-500">Intelligence</span></h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Cloud Dashboard</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 md:w-56 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" placeholder="Vehicle ID..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:border-indigo-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                            {['all', 'parked', 'departed'].map((status) => (
                                <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filterStatus === status ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{status}</button>
                            ))}
                        </div>
                        <select className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-[10px] font-black uppercase text-indigo-400 outline-none" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                            <option value="all">Zones</option>
                            {zones.map(z => <option key={z} value={z}>Zone {z}</option>)}
                        </select>
                        <input type="date" className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-4 text-[11px] font-bold text-slate-300 outline-none" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                        <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20"><Download size={14} /> EXCEL</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Live Occupancy" value={stats.activeParked} icon={<Car size={20} />} color="indigo" />
                    <StatCard title="Revenue Flow" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={<Wallet size={20} />} color="emerald" trend="+14%" />
                    <StatCard title="Traffic Vol" value={stats.totalUnits} icon={<TrendingUp size={20} />} color="blue" />
                    <StatCard title="Peak Hour" value={intelligence.peakHour !== "N/A" ? `${intelligence.peakHour}:00` : "N/A"} icon={<Clock size={20} />} color="amber" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl flex flex-col">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><History className="w-4 h-4 text-indigo-500" /> Transaction Timeline</h3>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Showing {filteredData.length > 0 ? indexOfFirstRecord + 1 : 0}-{Math.min(indexOfLastRecord, filteredData.length)} of {filteredData.length}</span>
                    </div>

                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] text-slate-600 uppercase tracking-widest bg-slate-950/50">
                                    <th className="px-6 py-4 font-black">Identity</th><th className="px-6 py-4 font-black">Slot</th><th className="px-6 py-4 font-black">Movement</th><th className="px-6 py-4 font-black text-right pr-8">Fee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filteredData.slice(indexOfFirstRecord, indexOfLastRecord).map((session) => (
                                    <tr key={session._id || Math.random()} className="group hover:bg-indigo-600/[0.03] transition-all">
                                        <td className="px-6 py-5"><div className="flex flex-col"><span className="font-mono font-black text-white text-xs group-hover:text-indigo-400 uppercase">{session.vehicleNumber}</span><span className="text-[9px] text-slate-600 font-bold">{session.phone}</span></div></td>
                                        <td className="px-6 py-5"><span className="bg-slate-950 border border-slate-800 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{session.slotNumber}</span></td>
                                        <td className="px-6 py-5"><div className="flex flex-col gap-1.5"><div className="flex items-center gap-2 text-[10px] text-slate-400"><Navigation size={10} className="text-emerald-500" /> {formatFullDate(session.entryTime)}</div>
                                        {session.exitTime ? (<div className="flex items-center gap-2 text-[10px] text-slate-400"><LogOut size={10} className="text-rose-500" /> {formatFullDate(session.exitTime)} <span className="text-[9px] text-indigo-500 font-black">({formatParkingDuration(session.entryTime, session.exitTime)})</span></div>) 
                                        : (<div className="flex items-center gap-1.5 ml-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-[9px] font-black text-emerald-500 uppercase">On-Site</span></div>)}</div></td>
                                        <td className="px-6 py-5 text-right pr-8"><span className={`font-black text-xs ${session.amount ? 'text-white' : 'text-slate-700'}`}>{session.amount ? `₹${session.amount}` : "---"}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                                <AlertCircle size={48} className="opacity-20 mb-4" />
                                <p className="text-sm italic font-bold uppercase tracking-widest opacity-40">Zero Matches Found</p>
                                <button onClick={() => {setSearchTerm(""); setFilterStatus("all"); setFilterDate(""); setSelectedZone("all");}} className="mt-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest">Reset All Filters</button>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/20">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black ${currentPage === idx + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{idx + 1}</button>
                                ))}
                            </div>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    )}
                </section>

                <aside className="space-y-8">
                    <section className="bg-slate-900/40 border border-slate-800/50 rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8"><h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Zone Load</h3><button onClick={() => load()} disabled={isSyncing}><RefreshCw className={`text-indigo-500 w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /></button></div>
                        <div className="space-y-6">
                            {[...new Set(slots.map(s => s.row))].sort().map(zone => {
                                const zoneSlots = slots.filter(s => s.row === zone);
                                const total = zoneSlots.length;
                                const occupied = zoneSlots.filter(s => s.isOccupied).length;
                                const percentage = total === 0 ? 0 : Math.round((occupied / total) * 100);
                                return (
                                    <div key={zone} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span className="text-slate-500">Zone {zone} <span className="opacity-40 ml-1">({occupied}/{total})</span></span><span className="text-white">{percentage}%</span></div>
                                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800"><div className={`h-full transition-all duration-1000 ${percentage > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${percentage}%` }} /></div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <Zap className="absolute -right-4 -top-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-white/20 pb-2">Admin Analytics</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-2"><span className="text-[10px] text-white/70 font-bold uppercase">Avg Ticket</span><span className="text-lg font-black text-white leading-none">₹{intelligence.avgTicket}</span></div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-2"><span className="text-[10px] text-white/70 font-bold uppercase">System Load</span><span className="text-lg font-black text-white leading-none">{stats.systemLoad}%</span></div>
                        </div>
                        <p className="text-[10px] text-indigo-200 mt-6 leading-relaxed">System load is {stats.systemLoad > 70 ? 'High' : 'Optimal'}. Peak traffic is usually observed around {intelligence.peakHour !== "N/A" ? `${intelligence.peakHour}:00` : "N/A"}.</p>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;