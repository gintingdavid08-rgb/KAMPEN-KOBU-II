import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './components/LandingPage';
import DashboardHeader from './components/DashboardHeader';
import DataCard from './components/DataCard';
import FormModal from './components/FormModal';
import { RefreshCw, Layers, User, PlusCircle } from 'lucide-react';

const LIST_BANDARA = [
  'UPBU F.L. TOBING', 'UPBU LASIKIN', 'UPBU NATUNA',
  'UPBU JALALUDDIN', 'UPBU BINAKA', 'UPBU SILANGIT', 'OTBAN WILAYAH II'
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('faskampen');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [faskampenList, setFaskampenList] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [fasBandara, setFasBandara] = useState(LIST_BANDARA[0]);
  const [fasNamaAlat, setFasNamaAlat] = useState('');
  const [fasMerkTipe, setFasMerkTipe] = useState('');
  const [fasJumlah, setFasJumlah] = useState('1');
  const [fasKondisi, setFasKondisi] = useState('Baik');
  const [perBandara, setPerBandara] = useState(LIST_BANDARA[0]);
  const [perNama, setPerNama] = useState('');
  const [perNip, setPerNip] = useState('');
  const [perJabatan, setPerJabatan] = useState('AVSEC Junior');

  useEffect(() => {
    if (currentUser) fetchAllData();
  }, [currentUser]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      let fasQuery = supabase.from('faskampen').select('*');
      let perQuery = supabase.from('personnel').select('*');

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

  const handleSaveData = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'faskampen') {
        const payload = { airport_name: fasBandara, equipment_name: fasNamaAlat, brand_type: fasMerkTipe, quantity: parseInt(fasJumlah) || 1, status: fasKondisi, user_id: currentUser.id };
        if (editingItem) await supabase.from('faskampen').update(payload).eq('id', editingItem.id);
        else await supabase.from('faskampen').insert([payload]);
      } else {
        const payload = { airport_name: perBandara, full_name: perNama, nip: perNip, position: perJabatan, user_id: currentUser.id };
        if (editingItem) await supabase.from('personnel').update(payload).eq('id', editingItem.id);
        else await supabase.from('personnel').insert([payload]);
      }
      setShowFormModal(false);
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

  if (!currentUser) return <LandingPage onLoginSuccess={(u) => setCurrentUser(u)} />;

  const currentList = activeTab === 'faskampen' ? faskampenList : personnelList;
  const filteredList = currentList.filter(item => {
    const name = activeTab === 'faskampen' ? item.equipment_name : item.full_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <DashboardHeader currentUser={currentUser} onLogout={() => setCurrentUser(null)} />

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
            <button onClick={() => { setEditingItem(null); setShowFormModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Tambah Data
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-slate-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" /> Memuat data Supabase...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map(item => (
              <DataCard key={item.id} item={item} activeTab={activeTab} onEdit={(it) => { setEditingItem(it); setShowFormModal(true); }} onDelete={handleDeleteItem} />
            ))}
          </div>
        )}
      </main>

      <FormModal
        show={showFormModal} activeTab={activeTab} editingItem={editingItem} listBandara={LIST_BANDARA}
        onClose={() => setShowFormModal(false)} onSave={handleSaveData}
        fasBandara={fasBandara} setFasBandara={setFasBandara} fasNamaAlat={fasNamaAlat} setFasNamaAlat={setFasNamaAlat}
        fasMerkTipe={fasMerkTipe} setFasMerkTipe={setFasMerkTipe} fasJumlah={fasJumlah} setFasJumlah={setFasJumlah}
        fasKondisi={fasKondisi} setFasKondisi={setFasKondisi} perBandara={perBandara} setPerBandara={setPerBandara}
        perNama={perNama} setPerNama={setPerNama} perNip={perNip} setPerNip={setPerNip} perJabatan={perJabatan} setPerJabatan={setPerJabatan}
      />
    </div>
  );
}
