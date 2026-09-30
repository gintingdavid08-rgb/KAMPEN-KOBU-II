import React from 'react';

const ReportManager = ({ data }) => {

  // 1. FUNGSI EXPORT KE EXCEL (CSV)
  const exportToCSV = () => {
    if (!data || !data.length) return alert("Tidak ada data untuk diexport!");

    // Ambil header dari key object
    const headers = Object.keys(data[0]).join(",");
    
    // Ambil baris data
    const rows = data.map(item => 
      Object.values(item).map(val => `"${val}"`).join(",")
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    
    // Trigger download otomatis
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Pengawasan_Otban2_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. FUNGSI EXPORT / CETAK PDF
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      {/* Tombol Aksi */}
      <div className="flex gap-3 mb-4 print:hidden">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition"
        >
          📊 Export Excel (.csv)
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition"
        >
          📄 Export PDF / Cetak
        </button>
      </div>

      {/* Area Dokumen yang Akan Dicetak / Diexport */}
      <div id="printable-area" className="printable">
        {/* Kop Surat Sederhana (Hanya Muncul Saat Cetak/PDF) */}
        <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
          <h2 className="text-xl font-bold uppercase">KEMENTERIAN PERHUBUNGAN</h2>
          <h3 className="text-lg font-semibold uppercase">KANTOR OTORITAS BANDAR UDARA WILAYAH II MEDAN</h3>
          <p className="text-sm">Laporan Hasil Pengawasan & Fasilitas Keamanan Penerbangan</p>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse border border-gray-300">
            <thead className="bg-gray-100 print:bg-gray-200 text-gray-700 uppercase text-xs">
              <tr>
                <th className="border border-gray-300 p-2.5">No</th>
                <th className="border border-gray-300 p-2.5">Bandara / Entitas</th>
                <th className="border border-gray-300 p-2.5">Jenis Pengawasan</th>
                <th className="border border-gray-300 p-2.5">Tanggal</th>
                <th className="border border-gray-300 p-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className="border border-gray-300 p-2.5">{index + 1}</td>
                  <td className="border border-gray-300 p-2.5 font-medium">{row.bandara}</td>
                  <td className="border border-gray-300 p-2.5">{row.jenis}</td>
                  <td className="border border-gray-300 p-2.5">{row.tanggal}</td>
                  <td className="border border-gray-300 p-2.5">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;
