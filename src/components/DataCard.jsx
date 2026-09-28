import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function DataCard({ item, activeTab, onEdit, onDelete }) {
  const isFas = activeTab === 'faskampen';

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-slate-700 transition">
      <div className="flex justify-between items-start">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
          isFas ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {item.airport_name || 'BANDARA'}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(item.id, isFas ? 'faskampen' : 'personnel')} className="p-1.5 bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 rounded-lg">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm text-white">{isFas ? item.equipment_name : item.full_name}</h3>
        <p className="text-xs text-slate-400">{isFas ? (item.brand_type || 'Tanpa Tipe') : `NIP: ${item.nip || '-'}`}</p>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
        {isFas ? (
          <>
            <span className="text-slate-400">Jumlah: <strong className="text-white">{item.quantity || 1} Unit</strong></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Baik' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {item.status || 'Baik'}
            </span>
          </>
        ) : (
          <p className="text-slate-400">Jabatan: <span className="text-white font-medium">{item.position}</span></p>
        )}
      </div>

      <p className="text-[10px] text-slate-500 font-mono">User ID: {item.user_id}</p>
    </div>
  );
}