import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Lock, User, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { BASE_URL } from '../Utils/constants';


const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // We send { username, password } directly as the body
        const res = await axios.post(`${BASE_URL}/adminLogin`, 
            { ...formData }, // This sends: { username: "admin", password: "123" }
            { withCredentials: true }
        );
            toast.success("Authentication Successful", {
                position: "top-right",
                style: { backgroundColor: "#1e1b4b", color: "#818cf8" },
            });
            
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data || "Access Denied", {
                position: 'top-right',
                style: { backgroundColor: "#450a0a", color: "#f87171" },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
            <ToastContainer theme="dark" />
            
            {/* Background Decorative Glow */}
            <div className="absolute w-64 h-64 bg-indigo-600/10 blur-[120px] rounded-full top-1/4 left-1/4"></div>
            <div className="absolute w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full bottom-1/4 right-1/4"></div>

            <div className="relative bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 mb-4 transition-transform hover:rotate-12">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                        Park<span className="text-indigo-500">X</span> <span className="text-slate-500 font-light">Admin</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2">Secure Terminal Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Authorized ID</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text" 
                                name="username"
                                placeholder="Admin Username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                required 
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Security Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                required 
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-center gap-2">
                            {loading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>INITIALIZE ACCESS</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>
                </form>

                {/* Footer Disclaimer */}
                <p className="text-[9px] text-slate-600 text-center mt-8 uppercase tracking-widest leading-relaxed">
                    This is a restricted administrative system.<br/>Unauthorized access attempts are logged.
                </p>
            </div>
        </div>
    );
};

export default Login;