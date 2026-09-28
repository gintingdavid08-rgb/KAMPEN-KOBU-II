import React from 'react';
import { FileText, X, Save } from 'lucide-react';

export default function FormModal({
  show, activeTab, editingItem, listBandara, onClose, onSave,
  fasBandara, setFasBandara, fasNamaAlat, setFasNamaAlat, fasMerkTipe, setFasMerkTipe,
  fasJumlah, setFasJumlah, fasKondisi, setFasKondisi,
  perBandara, setPerBandara, perNama, setPerNama, perNip, setPerNip, perJabatan, setPerJabatan
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-lg space-y-5 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            {editingItem ? 'Edit Data' : 'Tambah Data'} ({activeTab === 'faskampen' ? 'Faskampen' : 'Personil'})
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={onSave} className="space-y-4 text-xs">
          {activeTab === 'faskampen' ? (
            <>
              <div>
                <label className="block text-slate-300 mb-1">Bandara</label>
                <select value={fasBandara} onChange={(e) => setFasBandara(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                  {listBandara.map((b, i) => <option key={i} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nama Alat</label>
                <input type="text" required value={fasNamaAlat} onChange={(e) => setFasNamaAlat(e.target.value)} placeholder="Contoh: X-Ray Bagasi" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Merk / Tipe</label>
                  <input type="text" value={fasMerkTipe} onChange={(e) => setFasMerkTipe(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Jumlah</label>
                  <input type="number" min="1" value={fasJumlah} onChange={(e) => setFasJumlah(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-300 mb-1">Bandara</label>
                <select value={perBandara} onChange={(e) => setPerBandara(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
                  {listBandara.map((b, i) => <option key={i} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Nama Lengkap</label>
                  <input type="text" required value={perNama} onChange={(e) => setPerNama(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">NIP</label>
                  <input type="text" value={perNip} onChange={(e) => setPerNip(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold">Batal</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}