import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Shield, Lock, User, Key, Layers, Plus, Trash2, Edit3, 
  Search, RefreshCw, X, LogOut, CheckCircle, AlertCircle, PlusCircle, UserCheck
} from 'lucide-react';

// Inisialisasi Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LIST_BANDARA = [
  'UPBU F.L. TOBING', 'UPBU LASIKIN', 'UPBU NATUNA',
  'UPBU JALALUDDIN', 'UPBU BINAKA', 'UPBU SILANGIT', 'OTBAN WILAYAH II'
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('faskampen');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Landing page / modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [identityInput, setIdentityInput] = useState('');
  const [roleInput, setRoleInput] = useState('operator');

  // Data States
  const [faskampenList, setFaskampenList] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form Inputs - Faskampen
  const [fasBandara, setFasBandara] = useState(LIST_BANDARA[0]);
  const [fasNamaAlat, setFasNamaAlat] = useState('');
  const [fasMerkTipe, setFasMerkTipe] = useState('');
  const [fasJumlah, setFasJumlah] = useState('1');
  const [fasKondisi, setFasKondisi] = useState('Baik');

  // Form Inputs - Personnel
  const [perBandara, setPerBandara] = useState(LIST_BANDARA[0]);
  const [perNama, setPerNama] = useState('');
  const [perNip, setPerNip] = useState('');
  const [perJabatan, setPerJabatan] = useState('AVSEC Junior');

  useEffect(() => {
    if (currentUser) fetchAllData();
  }, [currentUser]);

  // FETCH DATA PRIVACY: Menyesuaikan filter berdasarkan user_id jika bukan admin
  const fetchAllData = async () => {
    setLoading(true);
    try {
      let fasQuery = supabase.from('faskampen').select('*');
      let perQuery = supabase.from('personnel').select('*');

      // PRIVACY USER: Operator hanya lihat data miliknya sendiri
      if (currentUser.role !== 'admin') {
        fasQuery = fasQuery.eq('user_id', currentUser.id);
        perQuery = perQuery.eq('user_id', currentUser.id);
      }

      const { data: fasData } = await fasQuery.order('id', { ascending: false });
      const { data: perData } = await perQuery.order('id', { ascending: false });

      setFaskampenList(fasData || []);
      setPersonnelList(perData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!identityInput.trim()) return alert('Masukkan NIP/Email!');
    setCurrentUser({
      id: identityInput.trim().toLowerCase(),
      name: identityInput.trim(),
      role: roleInput
    });
    setShowLoginModal(false);
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'faskampen') {
        const payload = { 
          airport_name: fasBandara, 
          equipment_name: fasNamaAlat, 
          brand_type: fasMerkTipe, 
          quantity: parseInt(fasJumlah) || 1, 
          status: fasKondisi, 
          user_id: currentUser.id 
        };
        if (editingItem) await supabase.from('faskampen').update(payload).eq('id', editingItem.id);
        else await supabase.from('faskampen').insert([payload]);
      } else {
        const payload = { 
          airport_name: perBandara, 
          full_name: perNama, 
          nip: perNip, 
          position: perJabatan, 
          user_id: currentUser.id 
        };
        if (editingItem) await supabase.from('personnel').update(payload).eq('id', editingItem.id);
        else await supabase.from('personnel').insert([payload]);
      }
      setShowFormModal(false);
      resetForms();
      fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id, table) => {
    if (!window.confirm('Hapus data ini?')) return;
    await supabase.from(table).delete().eq('id', id);
    fetchAllData();
  };

  const resetForms = () => {
    setEditingItem(null);
    setFasNamaAlat('');
    setFasMerkTipe('');
    setFasJumlah('1');
    setPerNama('');
    setPerNip('');
  };

  // --- LANDING PAGE ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-500/20 text-blue-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-black text-sm tracking-wide uppercase text-white">
                  OTORITAS BANDAR UDARA WILAYAH II
                </h1>
                <p className="text-xs text-slate-400">
                  Sistem Monitoring Personil & Fasilitas Keamanan Penerbangan
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              Login Pegawai
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full space-y-8">
          <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
              OTORITAS BANDAR UDARA WILAYAH II
            </span>
            <h2 className="text-3xl font-black text-white max-w-2xl leading-tight">
              Pelindungan Maksimal & Pelayanan Optimal
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Mewujudkan operasional penerbangan yang aman, nyaman, dan patuh pada regulasi di seluruh wilayah kerja Otban II.
            </p>
          </div>
        </main>

        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6 relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-white text-base">Akses Sistem Monitoring</h3>
                </div>
                <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">NIP / Email Pegawai</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 19980101... atau nama@otban2.go.id"
                    value={identityInput}
                    onChange={(e) => setIdentityInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Peran (Role)</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="operator">User Operator (Data Sendiri)</option>
                    <option value="admin">Administrator (Semua Data)</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  <UserCheck className="w-4 h-4" /> Masuk Ke Dashboard
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DASHBOARD PAGE ---
  const currentList = activeTab === 'faskampen' ? faskampenList : personnelList;
  const filteredList = currentList.filter(item => {
    const name = activeTab === 'faskampen' ? item.equipment_name : item.full_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="font-bold text-sm text-white">SYSTEM MONITORING KAMPEN</h1>
            <p className="text-[10px] text-slate-400">Halo, {currentUser.name} ({currentUser.role})</p>
          </div>
        </div>
        <button onClick={() => setCurrentUser(null)} className="px-3 py-1.5 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-red-600 hover:text-white transition">
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            <button onClick={() => setActiveTab('faskampen')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'faskampen' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
              <Layers className="w-4 h-4 inline mr-1" /> Faskampen
            </button>
            <button onClick={() => setActiveTab('personnel')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'personnel' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
              <User className="w-4 h-4 inline mr-1" /> Personil
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            <button onClick={() => { resetForms(); setShowFormModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Tambah Data
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-slate-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" /> Memuat data Supabase...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 relative">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-bold">{item.airport_name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteItem(item.id, activeTab === 'faskampen' ? 'faskampen' : 'personnel')} className="text-red-400 hover:text-red-300 text-xs"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {activeTab === 'faskampen' ? (
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.equipment_name}</h3>
                    <p className="text-xs text-slate-400">{item.brand_type} • {item.quantity} Unit</p>
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{item.status}</span>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.full_name}</h3>
                    <p className="text-xs text-slate-400">NIP: {item.nip}</p>
                    <p className="text-xs text-blue-400 mt-1">{item.position}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Tambah Data {activeTab}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 text-xs">✕</button>
            </div>
            <form onSubmit={handleSaveData} className="space-y-3 text-xs">
              {activeTab === 'faskampen' ? (
                <>
                  <div>
                    <label className="block mb-1 text-slate-300">Bandara</label>
                    <select value={fasBandara} onChange={(e) => setFasBandara(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white">
                      {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">Nama Peralatan</label>
                    <input type="text" required value={fasNamaAlat} onChange={(e) => setFasNamaAlat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">Merk / Tipe</label>
                    <input type="text" required value={fasMerkTipe} onChange={(e) => setFasMerkTipe(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-slate-300">Jumlah</label>
                      <input type="number" required value={fasJumlah} onChange={(e) => setFasJumlah(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-300">Kondisi</label>
                      <select value={fasKondisi} onChange={(e) => setFasKondisi(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white">
                        <option value="Baik">Baik</option>
                        <option value="Rusak Ringan">Rusak Ringan</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-1 text-slate-300">Bandara</label>
                    <select value={perBandara} onChange={(e) => setPerBandara(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white">
                      {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">Nama Lengkap</label>
                    <input type="text" required value={perNama} onChange={(e) => setPerNama(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">NIP</label>
                    <input type="text" required value={perNip} onChange={(e) => setPerNip(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-300">Jabatan</label>
                    <input type="text" required value={perJabatan} onChange={(e) => setPerJabatan(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white" />
                  </div>
                </>
              )}
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold mt-2">Simpan Data</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
