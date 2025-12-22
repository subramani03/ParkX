import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get current path
    const [scrolled, setScrolled] = useState(false);

    // Track scroll for background transition
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Active state helper
    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 md:px-10 
            ${scrolled 
                ? "py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-2xl" 
                : "py-5 bg-transparent"}`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                
                {/* Brand Logo */}
                <div 
                    className="flex items-center gap-3 cursor-pointer group" 
                    onClick={() => navigate('/')}
                >
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-black text-lg">P</span>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-slate-100 uppercase hidden sm:block">
                        Park<span className="text-indigo-500">X</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Desktop Links - Hidden on Mobile */}
                    <div className="hidden md:flex items-center gap-2 mr-4 bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
                        {[
                            { name: 'Home', path: '/' },
                            { name: 'Slots', path: '/slotmanager' },
                            { name: 'Scanner', path: '/qrscanner' }
                        ].map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path} 
                                className={`px-5 py-2 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all
                                    ${isActive(link.path) 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Compact Menu for Mobile/Action */}
                    <div className="dropdown dropdown-end">
                        <div 
                            tabIndex={0} 
                            role="button" 
                            className="btn btn-ghost btn-circle bg-slate-900/50 border border-slate-800 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-4 z-[1] p-2 shadow-2xl bg-slate-900 border border-slate-800 rounded-2xl w-56 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        >
                            <li className="menu-title text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-2 px-4 pt-2">Quick Access</li>
                            <li>
                                <Link to={'/'} className={`py-3 rounded-xl mb-1 ${isActive('/') ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-slate-300'}`}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to={'/qrscanner'} className={`py-3 rounded-xl mb-1 ${isActive('/qrscanner') ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-slate-300'}`}>
                                    Security Scanner
                                </Link>
                            </li>
                            <li>
                                <Link to={'/slotmanager'} className={`py-3 rounded-xl ${isActive('/slotmanager') ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-slate-300'}`}>
                                    Slot Analytics
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;