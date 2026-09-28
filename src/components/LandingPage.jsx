import React, { useState } from 'react';
import { Shield, ChevronLeft, ChevronRight, Lock, UserCheck, ArrowRight } from 'lucide-react';

export default function LandingPage({ onLoginSuccess }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [identityInput, setIdentityInput] = useState('');
  const [roleInput, setRoleInput] = useState('operator');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      title: "Pelindungan Maksimal & Pelayanan Optimal",
      subtitle: "Mewujudkan operasional penerbangan yang aman, nyaman, dan patuh pada regulasi"
    },
    {
      url: "https://images.unsplash.com/photo-1519074069444-1ba4e32050e8?auto=format&fit=crop&w=1200&q=80",
      title: "Pengawasan Fasilitas KAMPEN Terintegrasi",
      subtitle: "Monitoring real-time kesiapan fasilitas keamanan penerbangan di wilayah kerja"
    }
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!identityInput.trim()) {
      alert('Silakan masukkan NIP atau Email terlebih dahulu.');
      return;
    }

    // Mengirim data user ke App.jsx
    onLoginSuccess({
      id: identityInput.trim().toLowerCase(),
      name: identityInput.trim(),
      role: roleInput
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
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

      {/* Main Content / Slider */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        <div className="relative h-[480px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
          <img
            src={slides[currentSlide].url}
            alt="Hero"
            className="w-full h-full object-cover transition-all duration-700 filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          <div className="absolute bottom-12 left-12 right-12 space-y-3">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase rounded-full">
              OTORITAS BANDAR UDARA WILAYAH II
            </span>
            <h2 className="text-3xl font-extrabold text-white max-w-2xl leading-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          <button
            onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur border border-slate-700/50 opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur border border-slate-700/50 opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Modal Login Pegawai */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-white text-base">Akses Sistem Monitoring</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  NIP / Email Pegawai
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Peran (Role)
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="operator">User Operator (Hanya Data Sendiri)</option>
                  <option value="admin">Administrator (Semua Data)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <UserCheck className="w-4 h-4" /> Masuk Ke Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
