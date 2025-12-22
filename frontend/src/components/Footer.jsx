import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full bg-[#020617] border-t border-slate-800/60 p-5">
            <div className="max-w-7xl mx-auto px-6 py-10">
                
                {/* Top Section: System Stats & Branding */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 ">
                    
                    {/* Brand & Mission */}
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-xs">P</span>
                            </div>
                            <span className="text-lg font-black tracking-tighter text-slate-100 uppercase">
                                Park<span className="text-indigo-500">X</span>
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed text-center md:text-left max-w-xs">
                            Advanced parking management systems providing real-time slot tracking and automated billing solutions.
                        </p>
                    </div>

                    {/* Quick Contact - Styled as Info Cards */}
                    <div className="flex flex-col items-center">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mb-4">Support Channels</h4>
                        <div className="flex flex-col gap-3">
                            <a href="mailto:help@parkx.com" className="group flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-xl hover:border-indigo-500/50 transition-all">
                                <i className="fa-solid fa-envelope text-indigo-500 group-hover:scale-110 transition-transform"></i>
                                <span className="text-xs text-slate-300">help@parkx.com</span>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="group flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-xl hover:border-indigo-500/50 transition-all">
                                <i className="fa-brands fa-instagram text-indigo-500 group-hover:scale-110 transition-transform"></i>
                                <span className="text-xs text-slate-300">@parkx_official</span>
                            </a>
                        </div>
                    </div>

                    {/* On-Call Duty Officers */}
                    <div className="flex flex-col items-center md:items-end">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold mb-4">System Admin</h4>
                        <div className="text-center md:text-right space-y-1">
                            <p className="text-xs text-slate-300">
                                Subramani: <a href="tel:+919965464663" className="text-slate-500 hover:text-indigo-400">+91 9965464663</a>
                            </p>
                            <p className="text-xs text-slate-300">
                                Surya: <a href="tel:+919384725988" className="text-slate-500 hover:text-indigo-400">+91 938472598</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;