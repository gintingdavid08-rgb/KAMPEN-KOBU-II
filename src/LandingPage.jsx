import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList, 
  ShieldAlert, 
  ExternalLink, 
  ArrowRight 
} from 'lucide-react';

export default function LandingPage({ onLoginClick }) {
  // --- LOGIKA SLIDER BANNER ---
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gambar banner diambil dari folder public kamu
  const bannerImages = [
    {
      url: '/hero1.jpeg',
      title: 'Pengawasan Keamanan Penerbangan Terintegrasi',
      subtitle: 'Selamat datang di Sistem Monitoring Personil & Fasilitas Keamanan Penerbangan (FASKAMPEN) Kantor Otoritas Bandar Udara Wilayah II.'
    },
    {
      url: '/hero2.jpeg',
      title: 'Pelindungan Maksimal & Pelayanan Optimal',
      subtitle: 'Mewujudkan operasional penerbangan yang aman, nyaman, dan patuh pada regulasi keselamatan.'
    },
    {
      url: '/hero3.jpeg',
      title: 'Reformasi Birokrasi & Pengawasan Berkelanjutan',
      subtitle: 'Layanan terpadu dan efisien untuk operasional wilayah udara Medan dan sekitarnya.'
    }
  ];

  // Auto slide berganti gambar setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 md:px-8 pb-12">
      
      {/* 1. NAVBAR HEADER */}
      <nav className="flex items-center justify-between py-4 border-b border-slate-800 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src="/logo-otban.png" 
            alt="Logo Otban II" 
            className="h-17 w-auto object-contain" 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
          <div>
            <h1 className="font-bold text-sm md:text-base text-white tracking-wide">
              OTORITAS BANDAR UDARA WILAYAH II
            </h1>
            <p className="text-xs text-slate-400">
              Sistem Monitoring Personil & Fasilitas Keamanan Penerbangan
            </p>
          </div>
        </div>

        <button 
          onClick={onLoginClick}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm px-4 py-2 rounded-xl font-medium transition shadow-lg shadow-blue-600/20"
        >
          Login Pegawai
        </button>
      </nav>

      <main className="max-w-6xl mx-auto">
        
        {/* 2. HERO SLIDER BANNER (KEREN & BERGERAK) */}
        <div className="relative w-full h-[380px] md:h-[540px] overflow-hidden rounded-2xl shadow-2xl my-6 border border-slate-800">
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{ backgroundImage: `url(${bannerImages[currentIndex].url})` }}
          >
            <div className="w-full h-full bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-6 md:p-10">
              <span className="inline-block px-3 py-1 bg-blue-600/80 text-blue-100 text-xs font-semibold rounded-full w-fit mb-3 backdrop-blur-sm">
                OTORITAS BANDAR UDARA WILAYAH II
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white max-w-2xl leading-tight mb-2">
                {bannerImages[currentIndex].title}
              </h2>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl mb-4">
                {bannerImages[currentIndex].subtitle}
              </p>
            </div>
          </div>

          {/* Tombol Panah Kiri & Kanan */}
          <button 
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1))}
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-sm transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % bannerImages.length)}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-slate-900/60 hover:bg-slate-900/90 text-white p-2 rounded-full backdrop-blur-sm transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Titik Indikator Slider */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3. PILIHAN 2 LAYANAN UTAMA */}
        <div className="pt-4">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              Pilihan Layanan Operasional
            </h3>
            <p className="text-slate-400 text-xs md:text-sm">
              Silakan pilih portal layanan yang ingin Anda akses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LAYANAN 1: HASIL PENGAWASAN KAMPEN */}
            <a 
              href={import.meta.env.VITE_EXTERNAL_PORTAL_URL} target="_blank" rel="noopener noreferrer">
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl transition-all shadow-lg flex flex-col justify-between">
            
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 group-hover:scale-105 transition-transform">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-blue-400 font-medium bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/50">
                    Portal Eksternal <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  HASIL PENGAWASAN KAMPEN
                </h4>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                  Akses portal rekapitulasi dan dokumentasi laporan kegiatan pengawasan harian petugas bandara.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                Buka Portal Rekap <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </a>

            {/* LAYANAN 2: MONITORING PERSONIL & FASKAMPEN */}
            <div 
              onClick={onLoginClick}
              className="cursor-pointer group bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400 group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                    Sistem Utama
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  Sistem Monitoring Personil & Fasilitas Keamanan Penerbangan
                </h4>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                  Sistem pemantauan real-time Personil & fasilitas keamanan penerbangan Kantor Otoritas Bandar Udara Wilayah II.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                Masuk ke Dashboard Monitoring <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
