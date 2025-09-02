import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, label, icon }) => {
    const location = useLocation();
    const active = location.pathname.startsWith(to);
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20'
                : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent'
                }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
};

const Sidebar = () => {
    return (
        <aside className="w-60 shrink-0 border-r border-zinc-800/60 bg-zinc-950/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/40 min-h-screen sticky top-0">
            <div className="p-4">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-zinc-100 font-semibold tracking-wide">Screenly</span>
                        </Link>
                    </div>
                    <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Overview</div>
                    <div className="space-y-1">
                        <NavItem to="/dashboard" label="Dashboard" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6a2 2 0 002 2h6" /></svg>} />
                        <NavItem to="/leaderboard" label="Leaderboard" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-6m3 6V9" /></svg>} />
                        <NavItem to="/timer" label="Timer" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" /></svg>} />
                    </div>
                </div>
                <div className="mb-6">
                    <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Account</div>
                    <div className="space-y-1">
                        <NavItem to="/settings" label="Settings" icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                    </div>
                </div>
            </div>
        </aside>
    );
};

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            <div className="max-w-7xl mx-auto flex">
                <Sidebar />
                <main className="flex-1 px-6 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
