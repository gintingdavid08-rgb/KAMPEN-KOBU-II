import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import { supabase } from './supabaseClient';
import { 
  Building2, PlusCircle, CheckCircle2, 
  Layers, Search, Filter, ShieldCheck, AlertTriangle, 
  LogOut, Trash2, Edit, User, X, Users, BadgeCheck, Clock, MapPin, Phone, Mail, Plane, Bell,
  Cpu, Bot, Send, Sparkles, Activity, Wrench, RefreshCw, FileText, Download, Printer
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
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [facilities, setFacilities] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [airports, setAirports] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('ALL');
  const [activeTab, setActiveTab] = useState('faskampen');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // State Notifikasi Audit Admin
  const [showAlertModal, setShowAlertModal] = useState(false);

  // State untuk AI Assistant Chatbot & Predictive Panel
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'ai', text: 'Halo! Saya **Otban AI Security Assistant**. Ada yang bisa saya bantu terkait regulasi penerbangan, kalibrasi Faskampen, atau status personel?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedPredictiveItem, setSelectedPredictiveItem] = useState(null);

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
    description: ''
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

  // Helper Audit Data Incomplete
  const getFacilityIncompleteFields = (item) => {
    const missing = [];
    if (!item.brand_type) missing.push('Merk/Tipe');
    if (!item.serial_number) missing.push('Serial Number');
    if (!item.facility_location && !item.location) missing.push('Lokasi Fasilitas');
    if (!item.installation_year) missing.push('Tahun Instalasi');
    if (!item.description) missing.push('Keterangan');
    return missing;
  };

  const getPersonnelIncompleteFields = (item) => {
    const missing = [];
    if (!item.nip) missing.push('NIP/NIK');
    if (!item.birth_place_date) missing.push('Tempat/Tgl Lahir');
    if (!item.license_number) missing.push('No. Lisensi');
    if (!item.expiry_date) missing.push('Masa Berlaku');
    return missing;
  };

  // ENGINE PREDICTIVE MAINTENANCE (FEATURE 5.0)
  const calculatePredictiveMaintenance = (item) => {
    const currentYear = new Date().getFullYear();
    const age = item.installation_year ? (currentYear - Number(item.installation_year)) : 0;
    const condition = item.condition_percent ?? 100;
    
    let healthScore = condition - (age * 4);
    if (healthScore < 0) healthScore = 5;

    let riskLevel = 'LOW';
    let recommendation = 'Pemeliharaan Rutin / Perawatan Berkala Normal.';
    let actionColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800';

    if (item.status === 'TIDAK LAIK' || condition < 50 || age >= 8) {
      riskLevel = 'CRITICAL';
      recommendation = 'Peralatan membutuhkan perbaikan total / penggantian unit baru (Overhaul Required).';
      actionColor = 'text-rose-400 bg-rose-950/40 border-rose-800';
    } else if (condition < 80 || age >= 4) {
      riskLevel = 'MEDIUM';
      recommendation = 'Disarankan Kalibrasi Ulang Sensor/Komponen & Pengujian Uji Laik Operasi.';
      actionColor = 'text-amber-400 bg-amber-950/40 border-amber-800';
    }

    const estimatedRemainingLife = Math.max(0, 10 - age);

    return {
      age,
      healthScore: Math.min(100, Math.max(0, healthScore)),
      riskLevel,
      recommendation,
      estimatedRemainingLife,
      actionColor
    };
  };

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

  const fetchUserProfile = async (userId, userEmail) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
        setUserProfile(data);
      } else {
        const isAdminUser = userEmail && userEmail.toLowerCase().includes('admin');
        setUserProfile({ 
          id: userId, 
          email: userEmail,
          role: isAdminUser ? 'ADMIN' : 'STAFF', 
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
      else setAuthMode('login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
  };

  const cleanFormData = (obj) => {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
  };

  const isAdmin = userProfile?.role?.toUpperCase() === 'ADMIN' || (session?.user?.email && session.user.email.toLowerCase().includes('admin'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUserId = session?.user?.id;

    if (activeTab === 'faskampen') {
      const rawPayload = {
        airport_name: formFaskampen.airport_name,
        equipment_name: formFaskampen.equipment_name,
        brand_type: formFaskampen.brand_type,
        serial_number: formFaskampen.serial_number,
        facility_location: formFaskampen.facility_location || formFaskampen.location,
        installation_year: formFaskampen.installation_year ? Number(formFaskampen.installation_year) : null,
        condition_percent: formFaskampen.condition_percent ? Number(formFaskampen.condition_percent) : 100,
        status: formFaskampen.status,
        quantity: formFaskampen.quantity ? Number(formFaskampen.quantity) : 1,
        description: formFaskampen.description
      };

      const payload = cleanFormData(rawPayload);

      if (editingId) {
        const { error } = await supabase.from('facilities').update(payload).eq('id', editingId);
        if (error) alert("Gagal update fasilitas: " + error.message);
      } else {
        const { error } = await supabase.from('facilities').insert([{ ...payload, user_id: currentUserId }]);
        if (error) alert("Gagal simpan fasilitas: " + error.message);
      }
    } else if (activeTab === 'personel') {
      const payloadPersonnel = cleanFormData(formPersonnel);

      if (editingId) {
        const { error } = await supabase.from('personnel').update(payloadPersonnel).eq('id', editingId);
        if (error) alert("Gagal update personel: " + error.message);
      } else {
        const { error } = await supabase.from('personnel').insert([{ ...payloadPersonnel, user_id: currentUserId }]);
        if (error) alert("Gagal simpan personel: " + error.message);
      }
    } else if (activeTab === 'bandara') {
      const payloadAirport = cleanFormData(formAirport);

      if (editingId) {
        const { error } = await supabase.from('airports_info').update(payloadAirport).eq('id', editingId);
        if (error) alert("Gagal update bandara: " + error.message);
      } else {
        const { error } = await supabase.from('airports_info').insert([{ ...payloadAirport, user_id: currentUserId }]);
        if (error) alert("Gagal simpan bandara: " + error.message);
      }
    }

    resetForm();
    fetchAllData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    if (activeTab === 'faskampen') {
      await supabase.from('facilities').delete().eq('id', id);
    } else if (activeTab === 'personel') {
      await supabase.from('personnel').delete().eq('id', id);
    } else if (activeTab === 'bandara') {
      await supabase.from('airports_info').delete().eq('id', id);
    }
    fetchAllData();
  };

  const handleEdit = (item, tabOverride) => {
    if (tabOverride) setActiveTab(tabOverride);
    
    setEditingId(item.id);
    const targetTab = tabOverride || activeTab;

    if (targetTab === 'faskampen') {
      setFormFaskampen({
        ...initialFaskampen,
        ...item,
        facility_location: item.facility_location || item.location || ''
      });
    } else if (targetTab === 'personel') {
      setFormPersonnel({ ...initialPersonnel, ...item });
    } else if (targetTab === 'bandara') {
      setFormAirport({ ...initialAirportData, ...item });
    }
    setShowModal(true);
    setShowAlertModal(false);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setFormFaskampen(initialFaskampen);
    setFormPersonnel(initialPersonnel);
    setFormAirport(initialAirportData);
  };

  // AI Chat Assistant Logic
  const handleSendAiMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let aiReply = "Maaf, saya belum memahami pertanyaan Anda secara spesifik. Cobalah bertanya seputar 'kalibrasi x-ray', 'lisensi avsec', atau 'jumlah fasilitas'.";
      const q = userMsg.toLowerCase();

      if (q.includes('lisensi') || q.includes('skp') || q.includes('personel')) {
        aiReply = `Berdasarkan data sistem, saat ini terdapat **${personnel.length} Personel Avsec** terdaftar. Pastikan lisensi diperpanjang sebelum masa berlaku habis (peringatan muncul H-14).`;
      } else if (q.includes('faskampen') || q.includes('fasilitas') || q.includes('alat')) {
        aiReply = `Sistem mencatat **${facilities.length} item Faskampen**. Gunakan fitur **Predictive Maintenance (Tombol AI)** pada tabel untuk menganalisis risiko kerusakan alat.`;
      } else if (q.includes('kalibrasi') || q.includes('x-ray') || q.includes('wtmd')) {
        aiReply = "Sesuai Standar Operasional Penerbangan, pengujian dan kalibrasi rutin X-Ray & WTMD wajib dilakukan secara bulanan/tahunan sesuai KM 36 Tahun 2024.";
      } else if (q.includes('otban') || q.includes('wilayah 2') || q.includes('medan')) {
        aiReply = "Kantor Otoritas Bandar Udara Wilayah II Medan membawahi pengawasan keselamatan & keamanan penerbangan untuk bandara di wilayah Sumatra Utara, Aceh, dan sekitarnya.";
      }

      setAiMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  // Filter Privasi Data
  const userFacilities = isAdmin 
    ? facilities 
    : facilities.filter(item => !item.user_id || item.user_id === session?.user?.id);

  const userPersonnel = isAdmin 
    ? personnel 
    : personnel.filter(item => !item.user_id || item.user_id === session?.user?.id);

  const userAirports = isAdmin 
    ? airports 
    : airports.filter(item => !item.user_id || item.user_id === session?.user?.id);

  // Perhitungan Audit Data Kosong
  const incompleteFacilities = userFacilities.map(f => ({
    ...f,
    type: 'faskampen',
    missing: getFacilityIncompleteFields(f)
  })).filter(f => f.missing.length > 0);

  const incompletePersonnel = userPersonnel.map(p => ({
    ...p,
    type: 'personel',
    missing: getPersonnelIncompleteFields(p)
  })).filter(p => p.missing.length > 0);

  const totalIncompleteAlerts = incompleteFacilities.length + incompletePersonnel.length;

  // Filter pencarian
  const filteredFacilities = userFacilities.filter(item => {
    const matchesSearch = (item.equipment_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.brand_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.facility_location || item.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.airport_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAirport = selectedAirport === 'ALL' || item.airport_name === selectedAirport;
    return matchesSearch && matchesAirport;
  });

  const filteredPersonnel = userPersonnel.filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.nip || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.birth_place_date || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.airport_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAirport = selectedAirport === 'ALL' || item.airport_name === selectedAirport;
    return matchesSearch && matchesAirport;
  });

  const filteredAirports = userAirports.filter(item => {
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

  // --- FITUR EXPORT CSV ---
  const exportToCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Laporan_Otban2_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'faskampen') {
      headers = ['Bandara', 'Nama Peralatan', 'Merk/Tipe', 'Serial Number', 'Lokasi', 'Tahun Instalasi', 'Jumlah', 'Kondisi (%)', 'Status', 'Keterangan'];
      rows = filteredFacilities.map(item => [
        `"${item.airport_name || ''}"`,
        `"${item.equipment_name || ''}"`,
        `"${item.brand_type || ''}"`,
        `"${item.serial_number || ''}"`,
        `"${item.facility_location || item.location || ''}"`,
        `"${item.installation_year || ''}"`,
        `"${item.quantity || 1}"`,
        `"${item.condition_percent ?? 100}"`,
        `"${item.status || ''}"`,
        `"${item.description || ''}"`
      ]);
    } else if (activeTab === 'personel') {
      headers = ['Bandara', 'Nama Lengkap', 'NIP/NIK', 'Tempat/Tgl Lahir', 'Tingkat Lisensi', 'No. Lisensi (SKP)', 'Masa Berlaku', 'Status Lisensi'];
      rows = filteredPersonnel.map(item => [
        `"${item.airport_name || ''}"`,
        `"${item.name || ''}"`,
        `"${item.nip || ''}"`,
        `"${item.birth_place_date || ''}"`,
        `"${item.license_level || ''}"`,
        `"${item.license_number || ''}"`,
        `"${item.expiry_date || ''}"`,
        `"${calculateLicenseStatus(item.expiry_date).text}"`
      ]);
    } else if (activeTab === 'bandara') {
      headers = ['Nama Bandara', 'ICAO/IATA', 'Penyelenggara', 'Kelas', 'Layanan LLP', 'Jam Operasional', 'Koordinat ARP', 'Elevasi', 'Pesawat Terbesar', 'Dimensi Runway', 'Kategori Keamanan', 'PKP-PK'];
      rows = filteredAirports.map(item => [
        `"${item.airport_name || ''}"`,
        `"${item.code_icao_iata || ''}"`,
        `"${item.organizer || ''}"`,
        `"${item.class_category || ''}"`,
        `"${item.llp_service || ''}"`,
        `"${item.operating_hours || ''}"`,
        `"${item.arp_coordinate || ''}"`,
        `"${item.elevation || ''}"`,
        `"${item.largest_aircraft || ''}"`,
        `"${item.runway_dimension || ''}"`,
        `"${item.security_category || ''}"`,
        `"${item.pkp_pk_category || ''}"`
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FITUR CETAK / EXPORT PDF ---
  const handlePrint = () => {
    window.print();
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative print:bg-white print:text-black">
      {/* STYLE KHUSUS MEDIA PRINT (PDF) */}
      <style>{`
        @media print {
          body { background-color: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:text-black { color: black !important; }
          .print\\:border-black { border-color: #000 !important; }
          table { width: 100% !important; border-collapse: collapse !important; color: black !important; }
          th, td { border: 1px solid #333 !important; padding: 6px !important; text-align: left !important; color: black !important; font-size: 10px !important; }
          th { background-color: #f0f0f0 !important; color: black !important; font-weight: bold !important; }
        }
      `}</style>

      {/* HEADER TAMPILAN PRINT / PDF LAPORAN */}
      <div className="hidden print:block p-4 mb-4 border-b-2 border-black">
        <h1 className="text-xl font-bold uppercase text-center">LAPORAN MONITORING {activeTab.toUpperCase()}</h1>
        <h2 className="text-md font-semibold text-center">KANTOR OTORITAS BANDAR UDARA WILAYAH II MEDAN</h2>
        <p className="text-xs text-center mt-1">Filter Bandara: {selectedAirport} | Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
      </div>

      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20 shadow-lg print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg"><Building2 className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-base font-bold tracking-wide text-yellow-400 flex items-center gap-2">
              SISTEM MONITORING PERSONEL & FASILITAS KEAMANAN PENERBANGAN
              <span className="px-2 py-0.5 bg-blue-900/80 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> 5.0 AI-Ready
              </span>
            </h1>
            <p className="text-xs text-blue-400">OTORITAS BANDAR UDARA WILAYAH II - Live Operational Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* TOMBOL ALERT NOTIFIKASI KHUSUS ADMIN */}
          {isAdmin && (
            <div className="relative">
              <button 
                onClick={() => setShowAlertModal(!showAlertModal)}
                className={`relative p-2 rounded-lg transition border flex items-center gap-1.5 ${
                  totalIncompleteAlerts > 0 
                    ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border-amber-800/80' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Audit Kelengkapan Data"
              >
                <Bell className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Alert</span>
                {totalIncompleteAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[9px] font-bold text-white items-center justify-center">
                      {totalIncompleteAlerts}
                    </span>
                  </span>
                )}
              </button>

              {/* FLYOUT PANEL AUDIT DATA INCOMPLETE */}
              {showAlertModal && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-4 text-xs">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <div>
                        <h3 className="font-bold text-white">Laporan Data Belum Lengkap</h3>
                        <p className="text-[10px] text-slate-400">Perlu tindak lanjut / perlengkapan data staf</p>
                      </div>
                    </div>
                    <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-white p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {totalIncompleteAlerts === 0 ? (
                      <div className="text-center py-6 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                        Semua data terinput dengan lengkap! 🎉
                      </div>
                    ) : (
                      <>
                        {incompleteFacilities.map(item => (
                          <div key={`fac-alert-${item.id}`} className="bg-slate-950 p-3 rounded-xl border border-amber-900/50 hover:border-amber-700 transition space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 bg-blue-950 text-blue-400 rounded text-[9px] font-bold">FASILITAS</span>
                              <span className="text-[10px] text-slate-400">{item.airport_name}</span>
                            </div>
                            <p className="font-bold text-slate-200">{item.equipment_name || 'Tanpa Nama'}</p>
                            <div className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900/40">
                              <span className="text-slate-400 block text-[10px] font-semibold mb-0.5">Kolom Kosong:</span>
                              {item.missing.join(', ')}
                            </div>
                            <button 
                              onClick={() => handleEdit(item, 'faskampen')}
                              className="w-full mt-1 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold rounded text-[11px] text-center block"
                            >
                              Lengkapi Data Sekarang
                            </button>
                          </div>
                        ))}

                        {incompletePersonnel.map(item => (
                          <div key={`per-alert-${item.id}`} className="bg-slate-950 p-3 rounded-xl border border-amber-900/50 hover:border-amber-700 transition space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 rounded text-[9px] font-bold">PERSONEL</span>
                              <span className="text-[10px] text-slate-400">{item.airport_name}</span>
                            </div>
                            <p className="font-bold text-slate-200">{item.name || 'Tanpa Nama'}</p>
                            <div className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900/40">
                              <span className="text-slate-400 block text-[10px] font-semibold mb-0.5">Kolom Kosong:</span>
                              {item.missing.join(', ')}
                            </div>
                            <button 
                              onClick={() => handleEdit(item, 'personel')}
                              className="w-full mt-1 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold rounded text-[11px] text-center block"
                            >
                              Lengkapi Data Sekarang
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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

      <div className="bg-slate-900/80 border-b border-slate-800 px-6 pt-3 flex gap-2 print:hidden">
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

      <div className="bg-slate-900/50 border-b border-slate-800 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
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

      <div className="px-6 pt-4 flex flex-wrap gap-4 justify-between items-center print:hidden">
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

        {/* TOMBOL LAPORAN & EXPORT PDF/CSV */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold transition"
            title="Export data ke Format CSV / Excel"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-xs font-semibold transition"
            title="Cetak Laporan atau Simpan ke PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      <main className="p-6 flex-1">
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Memuat data dari database...</div>
        ) : (
          <>
            {activeTab === 'faskampen' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl print:bg-white print:border-none print:shadow-none">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider print:bg-slate-200 print:text-black">
                    <tr>
                      <th className="px-4 py-3">Nama Peralatan</th>
                      <th className="px-4 py-3">Merk / Tipe / SN</th>
                      <th className="px-4 py-3">Lokasi Fasilitas</th>
                      <th className="px-4 py-3">Thn / Health Index</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Kondisi (%)</th>
                      <th className="px-4 py-3">Status Operasional</th>
                      <th className="px-4 py-3 print:hidden">AI Maintenance</th>
                      <th className="px-4 py-3 text-right print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300 print:divide-slate-300 print:text-black">
                    {filteredFacilities.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-8 text-slate-500">Tidak ada data fasilitas ditemukan.</td></tr>
                    ) : (
                      filteredFacilities.map((item) => {
                        const missing = getFacilityIncompleteFields(item);
                        const aiAnalysis = calculatePredictiveMaintenance(item);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition print:hover:bg-transparent">
                            <td className="px-4 py-3 font-bold text-white print:text-black">
                              <div className="flex items-center gap-1.5">
                                {item.equipment_name}
                                {missing.length > 0 && (
                                  <span className="px-1.5 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-800 rounded text-[9px] font-semibold flex items-center gap-0.5 print:hidden" title={`Belum lengkap: ${missing.join(', ')}`}>
                                    <AlertTriangle className="w-2.5 h-2.5" /> Incomplete
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300 print:text-black">
                              <div>{item.brand_type || '-'}</div>
                              {item.serial_number && <div className="text-[10px] text-slate-500 font-mono print:text-slate-700">SN: {item.serial_number}</div>}
                            </td>
                            <td className="px-4 py-3 text-slate-300 font-medium print:text-black">{item.facility_location || item.location || '-'}</td>
                            <td className="px-4 py-3 print:text-black">
                              <div>Thn: {item.installation_year || '-'}</div>
                              <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5 print:text-black">
                                <Activity className="w-3 h-3 text-cyan-400 print:hidden" /> Skor: {aiAnalysis.healthScore}%
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono print:text-black">{item.quantity || 1} Unit</td>
                            <td className="px-4 py-3 print:text-black">
                              <span className={`font-mono font-bold ${item.condition_percent >= 80 ? 'text-emerald-400' : item.condition_percent >= 50 ? 'text-amber-400' : 'text-rose-400'} print:text-black`}>
                                {item.condition_percent ?? 100}%
                              </span>
                            </td>
                            <td className="px-4 py-3 print:text-black">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border print:border-none print:p-0 ${
                                item.status === 'LAIK' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-rose-950/60 text-rose-400 border-rose-800'
                              } print:text-black`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 print:hidden">
                              <button 
                                onClick={() => setSelectedPredictiveItem({ item, analysis: aiAnalysis })}
                                className="px-2 py-1 bg-slate-800 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded flex items-center gap-1 text-[10px] font-semibold transition"
                              >
                                <Cpu className="w-3 h-3 text-cyan-400" /> Analisis AI
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1 print:hidden">
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

            {activeTab === 'personel' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl print:bg-white print:border-none print:shadow-none">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider print:bg-slate-200 print:text-black">
                    <tr>
                      <th className="px-4 py-3">Nama Lengkap / NIP</th>
                      <th className="px-4 py-3">Tempat, Tgl Lahir</th>
                      <th className="px-4 py-3">Tingkat Lisensi</th>
                      <th className="px-4 py-3">No. Lisensi (SKP)</th>
                      <th className="px-4 py-3">Masa Berlaku</th>
                      <th className="px-4 py-3">Status Lisensi</th>
                      <th className="px-4 py-3 text-right print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300 print:divide-slate-300 print:text-black">
                    {filteredPersonnel.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-slate-500">Tidak ada data personel ditemukan.</td></tr>
                    ) : (
                      filteredPersonnel.map((item) => {
                        const statusObj = calculateLicenseStatus(item.expiry_date);
                        const missing = getPersonnelIncompleteFields(item);
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition print:hover:bg-transparent">
                            <td className="px-4 py-3 print:text-black">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white print:text-black">{item.name}</span>
                                {missing.length > 0 && (
                                  <span className="px-1.5 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-800 rounded text-[9px] font-semibold flex items-center gap-0.5 print:hidden" title={`Belum lengkap: ${missing.join(', ')}`}>
                                    <AlertTriangle className="w-2.5 h-2.5" /> Incomplete
                                  </span>
                                )}
                              </div>
                              {item.nip && <div className="underline text-slate-400 font-mono text-[11px] mt-0.5 print:text-slate-700">{item.nip}</div>}
                            </td>
                            <td className="px-4 py-3 text-slate-300 font-medium print:text-black">
                              {item.birth_place_date || '-'}
                            </td>
                            <td className="px-4 py-3 print:text-black">
                              <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded text-[10px] font-bold print:border-none print:p-0 print:text-black">
                                {item.license_level}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono print:text-black">{item.license_number || '-'}</td>
                            <td className="px-4 py-3 text-slate-400 font-medium print:text-black">{item.expiry_date || '-'}</td>
                            <td className="px-4 py-3 print:text-black">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block print:border-none print:p-0 ${statusObj.color} print:text-black`}>
                                {statusObj.text}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-1 print:hidden">
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
                    <div key={apt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 print:bg-white print:border-black print:text-black">
                      <div className="flex justify-between items-start border-b border-slate-800 pb-4 print:border-black">
                        <div>
                          <h2 className="text-lg font-bold text-white print:text-black">{apt.airport_name}</h2>
                          <p className="text-xs text-blue-400 font-mono mt-0.5 print:text-black">ICAO/IATA: {apt.code_icao_iata || '-'}</p>
                        </div>
                        <div className="flex gap-2 print:hidden">
                          <button onClick={() => handleEdit(apt)} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(apt.id)} className="p-2 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Penyelenggara</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">{apt.organizer || '-'}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Kategori Kelas / LLP</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">Kelas {apt.class_category || '-'} / {apt.llp_service || '-'}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Jam Operasional</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">{apt.operating_hours || '-'}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Kategori Keamanan / PKP-PK</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">Kat {apt.security_category || '-'} / PKP-PK {apt.pkp_pk_category || '-'}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Koordinat ARP & Elevasi</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">{apt.arp_coordinate || '-'} ({apt.elevation || '-'})</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Pesawat Terbesar</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">{apt.largest_aircraft || '-'}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Dimensi Runway</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">{apt.runway_dimension || '-'}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 print:bg-slate-100 print:border-black">
                          <p className="text-slate-500 text-[10px] uppercase font-bold print:text-slate-700">Kontak / Email</p>
                          <p className="text-slate-200 font-medium mt-1 print:text-black">{apt.phone_fax || '-'} | {apt.email || '-'}</p>
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

      {/* FLOATING AI CHATBOT BUTTON & WINDOW (FEATURE 5.0) */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        {!showAiChat ? (
          <button 
            onClick={() => setShowAiChat(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-3 rounded-full shadow-2xl transition border border-cyan-400/30 group"
          >
            <Bot className="w-5 h-5 group-hover:rotate-12 transition transform" />
            <span className="text-xs font-bold tracking-wide">Otban AI Assistant</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-96 text-xs overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Otban AI Security Assistant</h3>
                  <p className="text-[10px] text-cyan-400">Online | Aviation Intelligence 5.0</p>
                </div>
              </div>
              <button onClick={() => setShowAiChat(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-950/50">
              {aiMessages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl text-[11px] leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendAiMessage} className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                placeholder="Tanyakan sesuatu seputar Faskampen..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* MODAL DETAIL PREDICTIVE MAINTENANCE (FEATURE 5.0) */}
      {selectedPredictiveItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 p-6 rounded-2xl text-slate-100 shadow-2xl">
            <button onClick={() => setSelectedPredictiveItem(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Cpu className="w-5 h-5" />
              <h2 className="font-bold text-base text-white">AI Predictive Maintenance Health Check</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Analisis prediktif kesehatan peralatan dan umur teknis fasilitas.</p>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-[10px]">Peralatan</p>
                  <p className="font-bold text-white text-sm">{selectedPredictiveItem.item.equipment_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedPredictiveItem.item.airport_name} | {selectedPredictiveItem.item.facility_location}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px]">Kategori Risiko</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${selectedPredictiveItem.analysis.actionColor}`}>
                    {selectedPredictiveItem.analysis.riskLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Umur Peralatan</p>
                  <p className="text-lg font-bold text-white mt-1">{selectedPredictiveItem.analysis.age} <span className="text-xs text-slate-500">Thn</span></p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Health Index</p>
                  <p className="text-lg font-bold text-cyan-400 mt-1">{selectedPredictiveItem.analysis.healthScore}%</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Estimasi Sisa Umur</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">{selectedPredictiveItem.analysis.estimatedRemainingLife} <span className="text-xs text-slate-500">Thn</span></p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 text-cyan-400">
                  <Wrench className="w-3.5 h-3.5" /> Rekomendasi Tindakan AI:
                </p>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {selectedPredictiveItem.analysis.recommendation}
                </p>
              </div>

              <button 
                onClick={() => setSelectedPredictiveItem(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition"
              >
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT DATA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:hidden">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 p-6 rounded-2xl text-slate-100 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button onClick={resetForm} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 border-b border-slate-800 pb-2">
              {editingId ? 'Edit Data' : 'Tambah Data'} {activeTab === 'faskampen' ? 'Fasilitas Keamanan' : activeTab === 'personel' ? 'Personel Avsec' : 'Lengkap Bandara'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {activeTab === 'faskampen' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Bandara</label>
                    <select 
                      value={formFaskampen.airport_name} 
                      onChange={(e) => setFormFaskampen({...formFaskampen, airport_name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    >
                      {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Peralatan *</label>
                    <input type="text" required value={formFaskampen.equipment_name} onChange={(e) => setFormFaskampen({...formFaskampen, equipment_name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="X-Ray Bagasi, WTMD, HHMD, dll." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Merk / Tipe</label>
                      <input type="text" value={formFaskampen.brand_type} onChange={(e) => setFormFaskampen({...formFaskampen, brand_type: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="Rapiscan / Astrophysics" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Serial Number</label>
                      <input type="text" value={formFaskampen.serial_number} onChange={(e) => setFormFaskampen({...formFaskampen, serial_number: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="SN123456" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Lokasi Fasilitas</label>
                    <input type="text" value={formFaskampen.facility_location} onChange={(e) => setFormFaskampen({...formFaskampen, facility_location: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="SCP 1, Area Check-in, Gedung Kargo, dll." />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Tahun Instalasi</label>
                      <input type="number" value={formFaskampen.installation_year} onChange={(e) => setFormFaskampen({...formFaskampen, installation_year: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Jumlah (Unit)</label>
                      <input type="number" value={formFaskampen.quantity} onChange={(e) => setFormFaskampen({...formFaskampen, quantity: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Kondisi (%)</label>
                      <input type="number" min="0" max="100" value={formFaskampen.condition_percent} onChange={(e) => setFormFaskampen({...formFaskampen, condition_percent: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Status Operasional</label>
                    <select value={formFaskampen.status} onChange={(e) => setFormFaskampen({...formFaskampen, status: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white">
                      <option value="LAIK">LAIK</option>
                      <option value="TIDAK LAIK">TIDAK LAIK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Keterangan</label>
                    <textarea value={formFaskampen.description} onChange={(e) => setFormFaskampen({...formFaskampen, description: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white h-20" placeholder="Operasi normal / butuh perawatan..." />
                  </div>
                </>
              )}

              {activeTab === 'personel' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Bandara</label>
                    <select 
                      value={formPersonnel.airport_name} 
                      onChange={(e) => setFormPersonnel({...formPersonnel, airport_name: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    >
                      {LIST_BANDARA.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Lengkap *</label>
                    <input type="text" required value={formPersonnel.name} onChange={(e) => setFormPersonnel({...formPersonnel, name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">NIP / NIK</label>
                      <input type="text" value={formPersonnel.nip} onChange={(e) => setFormPersonnel({...formPersonnel, nip: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Tempat, Tgl Lahir</label>
                      <input type="text" value={formPersonnel.birth_place_date} onChange={(e) => setFormPersonnel({...formPersonnel, birth_place_date: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="Medan, 01-01-1990" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tingkat Lisensi</label>
                    <select value={formPersonnel.license_level} onChange={(e) => setFormPersonnel({...formPersonnel, license_level: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white">
                      <option value="BASIC AVSEC">BASIC AVSEC</option>
                      <option value="JUNIOR AVSEC">JUNIOR AVSEC</option>
                      <option value="SENIOR AVSEC">SENIOR AVSEC</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">No. Lisensi (SKP)</label>
                      <input type="text" value={formPersonnel.license_number} onChange={(e) => setFormPersonnel({...formPersonnel, license_number: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Masa Berlaku (Expiry Date)</label>
                      <input type="date" value={formPersonnel.expiry_date} onChange={(e) => setFormPersonnel({...formPersonnel, expiry_date: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'bandara' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Nama Bandara *</label>
                      <input type="text" required value={formAirport.airport_name} onChange={(e) => setFormAirport({...formAirport, airport_name: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Kode ICAO / IATA</label>
                      <input type="text" value={formAirport.code_icao_iata} onChange={(e) => setFormAirport({...formAirport, code_icao_iata: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="WIMM / KNO" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Penyelenggara</label>
                      <input type="text" value={formAirport.organizer} onChange={(e) => setFormAirport({...formAirport, organizer: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Kelas Bandara</label>
                      <input type="text" value={formAirport.class_category} onChange={(e) => setFormAirport({...formAirport, class_category: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="I / II / III" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Layanan LLP</label>
                      <input type="text" value={formAirport.llp_service} onChange={(e) => setFormAirport({...formAirport, llp_service: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="AFIS / TWR" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Alamat Lengkap</label>
                    <input type="text" value={formAirport.address} onChange={(e) => setFormAirport({...formAirport, address: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Kode Pos</label>
                      <input type="text" value={formAirport.postal_code} onChange={(e) => setFormAirport({...formAirport, postal_code: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Telepon / Fax</label>
                      <input type="text" value={formAirport.phone_fax} onChange={(e) => setFormAirport({...formAirport, phone_fax: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Email</label>
                      <input type="email" value={formAirport.email} onChange={(e) => setFormAirport({...formAirport, email: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Jam Operasional</label>
                      <input type="text" value={formAirport.operating_hours} onChange={(e) => setFormAirport({...formAirport, operating_hours: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="07.00 s/d 17.00 WIB" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Koordinat ARP & Elevasi</label>
                      <input type="text" value={formAirport.arp_coordinate} onChange={(e) => setFormAirport({...formAirport, arp_coordinate: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="01 40 18 N / 098 53 23 E" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Pesawat Terbesar</label>
                      <input type="text" value={formAirport.largest_aircraft} onChange={(e) => setFormAirport({...formAirport, largest_aircraft: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="ATR-72 / B737" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Dimensi Runway</label>
                      <input type="text" value={formAirport.runway_dimension} onChange={(e) => setFormAirport({...formAirport, runway_dimension: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="1200 m x 30 m" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Kategori Keamanan</label>
                      <input type="text" value={formAirport.security_category} onChange={(e) => setFormAirport({...formAirport, security_category: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="G / F / E" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Kategori PKP-PK</label>
                      <input type="text" value={formAirport.pkp_pk_category} onChange={(e) => setFormAirport({...formAirport, pkp_pk_category: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="IV / V / VI" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Jarak ke Kota</label>
                      <input type="text" value={formAirport.city_distance} onChange={(e) => setFormAirport({...formAirport, city_distance: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="15 Km" />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Akses Transportasi</label>
                      <input type="text" value={formAirport.transportation} onChange={(e) => setFormAirport({...formAirport, transportation: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white" placeholder="Mobil & Motor / Taksi" />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg text-xs text-white transition shadow-md mt-4">
                Simpan Data
              </button>
            </form>
          </div>  
        </div>
      )}
    </div>
  );
}
