import React from 'react';
import { ShieldCheck, User, LogOut } from 'lucide-react';

export default function DashboardHeader({ currentUser, onLogout }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xs font-black text-white uppercase tracking-wider">DASHBOARD MONITORING AVSEC</h1>
          <p className="text-[10px] text-slate-400">Kantor Otoritas Bandar Udara Wilayah II Medan</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" /> {currentUser?.name || 'Pegawai'}
          </p>
          <span className="inline-block px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-bold text-blue-400 uppercase tracking-widest">
            {currentUser?.role || 'User'}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-2 bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </header>
  );
}