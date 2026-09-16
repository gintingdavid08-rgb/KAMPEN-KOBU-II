import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import { supabase } from './supabaseClient';
import { 
  Building2, PlusCircle, CheckCircle2, 
  Layers, Search, Filter, ShieldCheck, AlertTriangle, 
  LogOut, Trash2, Edit, User, X, Users, BadgeCheck, Clock
} from 'lucide-react';

const LIST_BANDARA = [
  'UPBU F.L. TOBING',
  'UPBU LASIKIN',
  'UPBU NATUNA',
  'UPBU JALALUDDIN',
  'UPBU BINAKA',
  'UPBU SILANGIT',
  'OTBAN WILAYAH II'
];

export default function App() {
  // 1. STATE MANAGEMENT
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Data States
  const [facilities, setFacilities] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [airports, setAirports] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('ALL');
  const [activeTab, setActiveTab] = useState('faskampen'); // 'faskampen' | 'personel' | 'bandara'

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Auth States
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initial Form Data
  const initialFaskampen = {
    airport_name: LIST_BANDARA[0],
    equipment_name: '',
    brand_type: '',
    serial_number: '',
    facility_location: '',
    installation_year: new Date().getFullYear(),
    condition_percent: 100,
    status: 'LAIK',
    quantity: 1,
    description: 'OPERASI NORMAL/BAIK'
  };

  const initialPersonnel = {
    airport_name: LIST_BANDARA[0],
    name: '',
    nip: '',
    birth_place_date: '',
    license_level: 'BASIC AVSEC',
    license_number: '',
    expiry_date: ''
  };

  const initialAirportData = {
    airport_name: LIST_BANDARA[0],
    organizer: 'Bandar Udara',
    address: '',
    phone_fax: '',
    email: '',
    postal_code: '',
    class_category: 'III',
    llp_service: 'AFIS',
    operating_hours: '07.00 wita s/d 14.00 wita',
    code_icao_iata: '',
    arp_coordinate: '',
    elevation: '',
    largest_aircraft: 'ATR-72 600',
    runway_dimension: '1200 m x 30 m',
    security_category: 'G',
    pkp_pk_category: 'IV',
    city_distance: '',
    transportation: 'Mobil & Motor'
  };

  const [formFaskampen, setFormFaskampen] = useState(initialFaskampen);
  const [formPersonnel, setFormPersonnel] = useState(initialPersonnel);
  const [formAirport, setFormAirport] = useState(initialAirportData);

  // Helper Status Lisensi
  const calculateLicenseStatus = (expiryDateStr) => {
    if (!expiryDateStr) return { text: 'TIDAK ADA DATA', color: 'text-slate-400 bg-slate-800' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 14) {
      return { text: 'AKTIF', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    } else if (diffDays >= 0 && diffDays <= 14) {
      return { text: 'Diharapkan Segera Memperpanjang License', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    } else {
      return { text: 'MATI', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
    }
  };

  // FETCH DATA & PROFILE
  const fetchUserProfile = async (userId, userEmail) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
        setUserProfile(data);
      } else {
        const isAdmin = userEmail && userEmail.toLowerCase().includes('admin');
        setUserProfile({ 
          id: userId, 
          email: userEmail,
          role: isAdmin ? 'ADMIN' : 'STAFF', 
          airport_access: 'UPBU F.L. TOBING' 
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const { data: facData } = await supabase.from('facilities').select('*').order('id', { ascending: true });
    if (facData) setFacilities(facData);

    const { data: perData } = await supabase.from('personnel').select('*').order('id', { ascending: true });
    if (perData) setPersonnel(perData);

    const { data: aptData } = await supabase.from('airports_info').select('*').order('id', { ascending: true });
    if (aptData) setAirports(aptData);
    
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchAllData();
  }, [session]);

  // HANDLERS
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
      else setShowLoginModal(false);
    } else {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
      else {
        setAuthMode('login');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericUserId = Number(userProfile?.user_id || userProfile?.id || 1) || 1;

    if (activeTab === 'faskampen') {
      if (editingId) {
        await supabase.from('facilities').update(formFaskampen).eq('id', editingId);
      } else {
        await supabase.from('facilities').insert([{ ...formFaskampen, user_id: numericUserId }]);
      }
    } else if (activeTab === 'personel') {
      if (editingId) {
        await supabase.from('personnel').update(formPersonnel).eq('id', editingId);
      } else {
        await supabase.from('personnel').insert([{ ...formPersonnel, user_id: numericUserId }]);
      }
    } else if (activeTab === 'bandara') {
      const { transportation, city_distance, district, province, notes, ...cleanAirportForm } = formAirport;

      if (editingId) {
        await supabase.from('airports_info').update(cleanAirportForm).eq('id', editingId);
      } else {
        await supabase.from('airports_info').insert([{ ...cleanAirportForm, user_id: numericUserId }]);
      }
    }

    resetForm();
    fetchAllData();
  };

  const handleDelete = async (id) => {
    if (activeTab === 'faskampen') {
      await supabase.from('facilities').delete().eq('id', id);
    } else if (activeTab === 'personel') {
      await supabase.from('personnel').delete().eq('id', id);
    } else if (activeTab === 'bandara') {
      await supabase.from('airports_info').delete().eq('id', id);
    }
    fetchAllData();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    if (activeTab === 'faskampen') setFormFaskampen(item);
    else if (activeTab === 'personel') setFormPersonnel(item);
    else if (activeTab === 'bandara') setFormAirport(item);
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setFormFaskampen(initialFaskampen);
    setFormPersonnel(initialPersonnel);
    setFormAirport(initialAirportData);
  };

  const isAdmin = userProfile?.role?.toUpperCase() === 'ADMIN' || (session?.user?.email && session.user.email.toLowerCase().includes('admin'));

  const filteredFacilities = facilities.filter(item => {
    const matchesSearch = (item.equipment_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.brand_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.facility_location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.airport_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAirport = selectedAirport === 'ALL' || item.airport_name === selectedAirport;
    return matchesSearch && matchesAirport;
  });

  const filteredPersonnel = personnel.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.nip || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.birth_place_date || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.airport_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAirport = selectedAirport === 'ALL' || item.airport_name === selectedAirport;
    return matchesSearch && matchesAirport;
  });

  const filteredAirports = airports.filter(item => {
    const matchesSearch = (item.airport_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.code_icao_iata || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAirport = selectedAirport === 'ALL' || item.airport_name === selectedAirport;
    return matchesSearch && matchesAirport;
  });

  const totalEquipments = filteredFacilities.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const laikCount = filteredFacilities.filter(i => i.status === 'LAIK').length;
  const tidakLaikCount = filteredFacilities.filter(i => i.status === 'TIDAK LAIK').length;

  const totalPersonel = filteredPersonnel.length;
  const personelAktif = filteredPersonnel.filter(i => calculateLicenseStatus(i.expiry_date).text === 'AKTIF').length;
  const personelPerluPerpanjang = filteredPersonnel.filter(i => calculateLicenseStatus(i.expiry_date).text === 'Diharapkan Segera Memperpanjang License').length;
  const personelMati = filteredPersonnel.filter(i => calculateLicenseStatus(i.expiry_date).text === 'MATI').length;

  if (!session) {
    return (
      <>
        <LandingPage onLoginClick={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl text-slate-100 shadow-2xl">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-xl"><Building2 className="w-6 h-6 text-white" /></div>
                <div>
                  <h1 className="text-lg font-bold">FASKAMPEN OTBAN II</h1>
                  <p className="text-xs text-slate-400">Sistem Monitoring Operasional</p>
                </div>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Staf/Unit</label>
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" placeholder="nama@otban2.go.id" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Password</label>
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" />
                </div>
                {authError && <p className="text-xs text-rose-400">{authError}</p>}
                <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg text-sm text-white transition shadow-md">
                  {authMode === 'login' ? 'Masuk' : 'Daftar Akun'}
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg"><Building2 className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-base font-bold tracking-wide text-yellow-400">
              SISTEM MONITORING PERSONEL & FASILITAS KEAMANAN PENERBANGAN
            </h1>
            <p className="text-xs text-blue-400">OTORITAS BANDAR UDARA WILAYAH II - Live Operational Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <div className="p-1.5 bg-slate-800 rounded-full text-blue-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-200 leading-none">{session.user.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isAdmin 
                    ? 'bg-purple-950 text-purple-400 border border-purple-800' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {isAdmin ? 'ADMIN' : 'STAFF'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            Input Data {activeTab === 'faskampen' ? 'Fasilitas' : activeTab === 'personel' ? 'Personel' : 'Bandara'}
          </button>
          
          <button onClick={handleLogout} className="p-2 bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 rounded-lg transition border border-slate-700" title="Keluar">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-6 pt-3 flex gap-2">
        <button
          onClick={() => setActiveTab('faskampen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-sm transition border-b-2 ${
            activeTab === 'faskampen' ? 'bg-slate-950 text-blue-400 border-blue-500' : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Fasilitas Keamanan (FASKAMPEN)
        </button>

        <button
          onClick={() => setActiveTab('personel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-sm transition border-b-2 ${
            activeTab === 'personel' ? 'bg-slate-950 text-blue-400 border-blue-500' : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Users className="w-4 h-4" /> Personel Avsec
        </button>

        <button
          onClick={() => setActiveTab('bandara')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-semibold text-sm transition border-b-2 ${
            activeTab === 'bandara' ? 'bg-slate-950 text-blue-400 border-blue-500' : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Building2 className="w-4 h-4" /> Data Lengkap Bandara
        </button>
      </div>

      {/* STATS */}
      <div className="bg-slate-900/50 border-b border-slate-800 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTab === 'faskampen' && (
          <>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Peralatan</p>
                <p className="text-2xl font-bold text-white">{totalEquipments} <span className="text-xs text-slate-500">Unit</span></p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Layers className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Kondisi Laik Operasi</p>
                <p className="text-2xl font-bold text-emerald-400">{laikCount} <span className="text-xs text-slate-500">Peralatan</span></p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle2 className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Perlu Perbaikan / Rusak</p>
                <p className="text-2xl font-bold text-rose-400">{tidakLaikCount} <span className="text-xs text-slate-500">Peralatan</span></p>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400"><AlertTriangle className="w-5 h-5" /></div>
            </div>
          </>
        )}

        {activeTab === 'personel' && (
          <>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Personel Avsec</p>
                <p className="text-2xl font-bold text-cyan-400">{totalPersonel} <span className="text-xs text-slate-500">Orang</span></p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400"><BadgeCheck className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Personel Active</p>
                <p className="text-2xl font-bold text-emerald-400">{personelAktif} <span className="text-xs text-slate-500">Orang</span></p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle2 className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Perlu Perpanjang / Mati</p>
                <p className="text-2xl font-bold text-amber-400">{personelPerluPerpanjang + personelMati} <span className="text-xs text-slate-500">Orang</span></p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400"><Clock className="w-5 h-5" /></div>
            </div>
          </>
        )}

        {activeTab === 'bandara' && (
          <>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Bandara Terdaftar</p>
                <p className="text-2xl font-bold text-purple-400">{filteredAirports.length} <span className="text-xs text-slate-500">Lokasi</span></p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><Building2 className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Akses Wilayah</p>
                <p className="text-xl font-bold text-white">{selectedAirport === 'ALL' ? 'Semua Bandara' : selectedAirport}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Filter className="w-5 h-5" /></div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Status Pengawasan</p>
                <p className="text-2xl font-bold text-emerald-400">AKTIF</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><ShieldCheck className="w-5 h-5" /></div>
            </div>
          </>
        )}
      </div>

      {/* FILTER */}
      <div className="px-6 pt-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari data..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="relative w-60">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
            <select
              value={selectedAirport}
              onChange={(e) => setSelectedAirport(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Bandara Wilayah II</option>
              {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="p-6 flex-1">
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Memuat data dari database...</div>
        ) : (
          <>
            {activeTab === 'faskampen' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Nama Peralatan</th>
                      <th className="px-4 py-3">Merk / Tipe / SN</th>
                      <th className="px-4 py-3">Lokasi Fasilitas</th>
                      <th className="px-4 py-3">Tahun Instalasi</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Kondisi (%)</th>
                      <th className="px-4 py-3">Status Operasional</th>
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {filteredFacilities.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-8 text-slate-500">Tidak ada data fasilitas ditemukan.</td></tr>
                    ) : (
                      filteredFacilities.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3 font-bold text-white">{item.equipment_name}</td>
                          <td className="px-4 py-3 text-slate-300">
                            <div>{item.brand_type || '-'}</div>
                            {item.serial_number && <div className="text-[10px] text-slate-500 font-mono">SN: {item.serial_number}</div>}
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-medium">{item.facility_location || '-'}</td>
                          <td className="px-4 py-3">{item.installation_year}</td>
                          <td className="px-4 py-3 font-mono">{item.quantity} Unit</td>
                          <td className="px-4 py-3">
                            <span className={`font-mono font-bold ${item.condition_percent >= 80 ? 'text-emerald-400' : item.condition_percent >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {item.condition_percent}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              item.status === 'LAIK' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-rose-950/60 text-rose-400 border-rose-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{item.description}</td>
                          <td className="px-4 py-3 text-right space-x-1">
                            <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'personel' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Nama Lengkap / NIP</th>
                      <th className="px-4 py-3">Tempat, Tgl Lahir</th>
                      <th className="px-4 py-3">Tingkat Lisensi</th>
                      <th className="px-4 py-3">No. Lisensi (SKP)</th>
                      <th className="px-4 py-3">Masa Berlaku</th>
                      <th className="px-4 py-3">Status Lisensi</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {filteredPersonnel.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-slate-500">Tidak ada data personel ditemukan.</td></tr>
                    ) : (
                      filteredPersonnel.map((item) => {
                        const statusObj = calculateLicenseStatus(item.expiry_date);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition">
                            <td className="px-4 py-3">
                              <div className="font-bold text-white">{item.name}</div>
                              {item.nip && <div className="underline text-slate-400 font-mono text-[11px] mt-0.5">{item.nip}</div>}
                            </td>
                            <td className="px-4 py-3 text-slate-300 font-medium">
                              {item.birth_place_date || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded text-[10px] font-bold">
                                {item.license_level}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono">{item.license_number || '-'}</td>
                            <td className="px-4 py-3 text-slate-400 font-medium">{item.expiry_date || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${statusObj.color}`}>
                                {statusObj.text}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1">
                              <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bandara' && (
              <div className="space-y-6">
                {filteredAirports.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
                    Belum ada data detail bandara.
                  </div>
                ) : (
                  filteredAirports.map((apt) => (
                    <div key={apt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                        <div>
                          <h2 className="text-lg font-bold text-white">{apt.airport_name}</h2>
                          <p className="text-xs text-blue-400 font-mono mt-0.5">ICAO/IATA: {apt.code_icao_iata || '-'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(apt)} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(apt.id)} className="p-2 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        <div className="space-y-2">
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Informasi Umum</p>
                          <div><span className="text-slate-500">Penyelenggara:</span> <p className="font-medium text-slate-200">{apt.organizer}</p></div>
                          <div><span className="text-slate-500">Kelas Bandara:</span> <p className="font-medium text-slate-200">{apt.class_category}</p></div>
                          <div><span className="text-slate-500">Jam Operasi:</span> <p className="font-medium text-slate-200">{apt.operating_hours}</p></div>
                        </div>

                        <div className="space-y-2">
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Spesifikasi Operasional</p>
                          <div><span className="text-slate-500">Pesawat Terbesar:</span> <p className="font-medium text-slate-200">{apt.largest_aircraft}</p></div>
                          <div><span className="text-slate-500">Dimensi Runway:</span> <p className="font-medium text-slate-200">{apt.runway_dimension}</p></div>
                        </div>

                        <div className="space-y-2">
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Fasilitas & Layanan</p>
                          <div><span className="text-slate-500">Layanan LLP:</span> <p className="font-medium text-slate-200">{apt.llp_service}</p></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL INPUT / EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-2xl text-slate-100 shadow-2xl my-8">
            <button onClick={resetForm} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4">
              {editingId ? 'Edit Data' : 'Input Data'} {activeTab === 'faskampen' ? 'Fasilitas' : activeTab === 'personel' ? 'Personel Avsec' : 'Bandara'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'faskampen' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Bandara</label>
                    <select 
                      value={formFaskampen.airport_name} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, airport_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nama Peralatan</label>
                    <input 
                      type="text" required
                      value={formFaskampen.equipment_name} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, equipment_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Merk / Tipe</label>
                    <input 
                      type="text" 
                      value={formFaskampen.brand_type} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, brand_type: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nomor Seri (SN)</label>
                    <input 
                      type="text" 
                      value={formFaskampen.serial_number} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, serial_number: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Lokasi Fasilitas</label>
                    <input 
                      type="text" 
                      value={formFaskampen.facility_location} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, facility_location: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tahun Instalasi</label>
                    <input 
                      type="number" 
                      value={formFaskampen.installation_year} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, installation_year: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Jumlah (Unit)</label>
                    <input 
                      type="number" min="1"
                      value={formFaskampen.quantity} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, quantity: Number(e.target.value)})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Kondisi (%)</label>
                    <input 
                      type="number" min="0" max="100"
                      value={formFaskampen.condition_percent} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, condition_percent: Number(e.target.value)})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Status Operasional</label>
                    <select 
                      value={formFaskampen.status} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, status: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="LAIK">LAIK</option>
                      <option value="TIDAK LAIK">TIDAK LAIK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Keterangan</label>
                    <input 
                      type="text" 
                      value={formFaskampen.description} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, description: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'personel' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Bandara</label>
                    <select 
                      value={formPersonnel.airport_name} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, airport_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nama Lengkap</label>
                    <input 
                      type="text" required
                      value={formPersonnel.name} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, name: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">NIP / NIK</label>
                    <input 
                      type="text" 
                      value={formPersonnel.nip} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, nip: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tempat, Tgl Lahir</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Medan, 12 Januari 1995"
                      value={formPersonnel.birth_place_date} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, birth_place_date: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tingkat Lisensi</label>
                    <select 
                      value={formPersonnel.license_level} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, license_level: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="BASIC AVSEC">BASIC AVSEC</option>
                      <option value="JUNIOR AVSEC">JUNIOR AVSEC</option>
                      <option value="SENIOR AVSEC">SENIOR AVSEC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Nomor Lisensi (SKP)</label>
                    <input 
                      type="text" 
                      value={formPersonnel.license_number} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, license_number: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tanggal Masa Berlaku Lisensi</label>
                    <input 
                      type="date" 
                      value={formPersonnel.expiry_date} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, expiry_date: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'bandara' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Bandara</label>
                    <select 
                      value={formAirport.airport_name} 
                      onChange={(e) => setFormAirport({...formAirport, airport_name: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    >
                      {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Kode ICAO / IATA</label>
                    <input 
                      type="text" 
                      value={formAirport.code_icao_iata} 
                      onChange={(e) => setFormAirport({...formAirport, code_icao_iata: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Penyelenggara</label>
                    <input 
                      type="text" 
                      value={formAirport.organizer} 
                      onChange={(e) => setFormAirport({...formAirport, organizer: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Kelas Bandara</label>
                    <input 
                      type="text" 
                      value={formAirport.class_category} 
                      onChange={(e) => setFormAirport({...formAirport, class_category: e.target.value})}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
