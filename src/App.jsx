import { useState, useEffect } from 'react';
import { 
  Search, FileText, Send, Sparkles, MessageSquare, Clock, 
  User, Layout, ChevronRight, Loader2, Database, Info, Filter, 
  Download, BarChart3, CheckCircle2, Lock, 
  Eye, EyeOff, Paperclip, Sun, Moon
} from 'lucide-react';

// --- DATA MOCKUP (Diletakkan di luar komponen agar tidak re-render) ---
const ECM_DOCUMENTS = [
  { id: 1, title: 'Kebijakan Kredit Pemilikan Rumah (KPR) 2024.pdf', type: 'Kebijakan', size: '1.2 MB', date: '2024-01-10' },
  { id: 2, title: 'Syarat & Ketentuan Panin Kartu Kredit Gold.pdf', type: 'Produk', size: '850 KB', date: '2023-12-05' },
  { id: 3, title: 'SOP Penanganan Keluhan Nasabah Prioritas.docx', type: 'SOP', size: '2.1 MB', date: '2024-02-15' },
  { id: 4, title: 'Panduan KYC & AML Perbankan Digital.pdf', type: 'Regulasi', size: '3.4 MB', date: '2024-01-20' },
];

const CUSTOMER_ARCHIVES = [
  { id: 101, name: 'Andi Setiawan', doc: 'KTP_Scan_2022.jpg', cat: 'Identitas', cif: 'CIF99201' },
  { id: 102, name: 'Andi Setiawan', doc: 'SHM_Agunan_KPR_No442.pdf', cat: 'Agunan', cif: 'CIF99201' },
  { id: 103, name: 'Budi Santoso', doc: 'Formulir_Pembukaan_Rekening.pdf', cat: 'Administrasi', cif: 'CIF88273' },
  { id: 104, name: 'Siti Aminah', doc: 'Slip_Gaji_Nasabah_Q4.pdf', cat: 'Finansial', cif: 'CIF77210' },
];

const App = () => {
  // --- STATE THEME (DARK MODE) ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- STATE AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- STATE NAVIGASI ---
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- STATE SMART ECM ---
  const [ecmSearch, setEcmSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // --- STATE ARSIP STAF ---
  const [archiveSearch, setArchiveSearch] = useState('');
  const [foundArchives, setFoundArchives] = useState([]);
  const [isArchiveSearching, setIsArchiveSearching] = useState(false);
  const [archiveInsight, setArchiveInsight] = useState('');

  // --- STATE CRM ---
  const [isCrmGenerating, setIsCrmGenerating] = useState(false);
  const [crmResponse, setCrmResponse] = useState('');
  const [userChatInput, setUserChatInput] = useState('');

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!employeeId) return setLoginError('ID Karyawan wajib diisi.');
    setIsLoggingIn(true);
    setLoginError('');
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsLoggedIn(true);
    }, 1500);
  };

  const handleEcmSummarize = (doc) => {
    setSelectedDoc(doc);
    setIsSummarizing(true);
    setAiSummary('');
    setTimeout(() => {
      setAiSummary(`Berdasarkan analisis AI terhadap dokumen "${doc.title}", poin pentingnya adalah: (1) Perubahan suku bunga menjadi 5.5% fixed 3 tahun, (2) Persyaratan dokumen agunan harus asli dan tersertifikasi, (3) Waktu pemrosesan dipangkas menjadi 3 hari kerja melalui sistem otomasi.`);
      setIsSummarizing(false);
    }, 2000);
  };

  const handleArchiveSearch = () => {
    if (!archiveSearch) return;
    setIsArchiveSearching(true);
    setFoundArchives([]);
    setArchiveInsight('');
    setTimeout(() => {
      const results = CUSTOMER_ARCHIVES.filter(d => 
        d.name.toLowerCase().includes(archiveSearch.toLowerCase()) || 
        d.cif.toLowerCase().includes(archiveSearch.toLowerCase())
      );
      setFoundArchives(results);
      if(results.length > 0) {
        setArchiveInsight(`AI Insight: Nasabah atas nama ${archiveSearch} memiliki profil risiko rendah. Dokumen agunan SHM terdeteksi valid. AI merekomendasikan verifikasi ulang untuk dokumen KTP yang akan kadaluarsa dalam 6 bulan.`);
      }
      setIsArchiveSearching(false);
    }, 1500);
  };

  const handleCrmAssist = () => {
    setIsCrmGenerating(true);
    setTimeout(() => {
      setCrmResponse("Halo Bapak Andi Setiawan, terima kasih telah menghubungi Bank Panin. Berdasarkan pengecekan sistem kami terhadap dokumen KPR Anda di ECM, permohonan Anda sudah dalam tahap verifikasi agunan. Promo bunga 5.5% tetap berlaku untuk Anda. Apakah ada dokumen lain yang ingin Anda tanyakan?");
      setIsCrmGenerating(false);
    }, 2000);
  };

  // --- COMPONENT: LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 font-sans transition-colors duration-300 relative">
        {/* Toggle Mode Gelap */}
        <button 
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-6 right-6 p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all duration-300"
          title="Ubah Tema"
        >
          {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
        </button>

        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-10 animate-in fade-in zoom-in-95 duration-500 border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md p-2 border border-slate-100 dark:border-slate-600 transition-colors duration-300">
              <img 
                src="logo_panin.png"
                alt="Panin Bank" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-red-500 tracking-tight leading-tight uppercase">Panin <span className="text-blue-500 dark:text-blue-400">Akses</span></h1>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-[0.2em] mt-1">Enterprise Service Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="ID Karyawan" 
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" 
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Kata Sandi" 
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" 
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {loginError && <p className="text-red-500 dark:text-red-400 text-[10px] font-bold text-center uppercase tracking-wide">{loginError}</p>}
            <button disabled={isLoggingIn} className="w-full bg-indigo-900 dark:bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95">
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : "Login"}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700/50 text-center">
             <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-loose">
               Sistem Terenkripsi & Dipantau <br /> Bank Panin Cybersecurity Division
             </p>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPONENT: MAIN APP ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 dark:bg-slate-950 text-white p-6 hidden md:flex flex-col fixed h-full z-50 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold italic"><img src="logo_panin.png" alt="Panin Bank" className="max-w-full max-h-full object-contain"/></div>
          <span className="font-bold text-lg tracking-tight">Panin <span className="text-blue-400 font-black italic">AKSES</span></span>
        </div>
        <nav className="space-y-1 flex-1">
          {[
            { id: 'dashboard', icon: Layout, label: 'Dashboard' },
            { id: 'ecm', icon: FileText, label: 'Smart ECM' },
            { id: 'archive', icon: Database, label: 'Arsip' },
            { id: 'crm', icon: MessageSquare, label: 'Layanan Nasabah' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center gap-3 w-full p-4 rounded-2xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-indigo-800 dark:bg-indigo-600 text-white shadow-lg dark:shadow-none' : 'text-indigo-300 dark:text-slate-400 hover:bg-indigo-900/50 dark:hover:bg-slate-900/50 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label.toUpperCase()}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-indigo-900 dark:border-slate-800 px-2">
          <button onClick={() => setIsLoggedIn(false)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-white transition">Log out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <div>
            <h1 className="text-xl font-black text-indigo-950 dark:text-white uppercase tracking-tight">
              {activeTab === 'dashboard' && "Kinerja Layanan Terintegrasi AI"}
              {activeTab === 'ecm' && "Enterprise Content Management"}
              {activeTab === 'archive' && "AI Archive Search"}
              {activeTab === 'crm' && "Service Interaction"}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              User: Maulana Yusup Wijaya • ID: {employeeId}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Toggle Mode Gelap */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl shadow-inner hover:scale-105 active:scale-95 transition-all duration-300"
              title="Ubah Tema"
            >
              {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black shadow-inner">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Tab Content: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Speed Improvement', val: '45%', icon: Clock, color: 'green', desc: 'Penurunan waktu siklus' },
                { label: 'AI Prediction Accuracy', val: '94.2%', icon: Sparkles, color: 'indigo', desc: 'Akurasi draf jawaban' },
                { label: 'Customer Satisfaction', val: '8.9/10', icon: CheckCircle2, color: 'orange', desc: 'Skor interaksi CRM' },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center transition-all duration-300">
                  <div className={`w-12 h-12 bg-${card.color}-50 dark:bg-${card.color}-950/30 text-${card.color}-600 dark:text-${card.color}-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm`}> <card.icon size={24} /> </div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">{card.val}</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{card.label}</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 italic">"{card.desc}"</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300">
                  <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6 flex items-center gap-2">
                    <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400"/> Efisiensi Layanan
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-slate-600 dark:text-slate-400"> <span>Pencarian Dokumen</span> <span className="text-green-600 dark:text-green-400">80% Lebih Cepat</span> </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="bg-slate-200 dark:bg-slate-600 w-full"></div>
                        <div className="bg-indigo-600 dark:bg-indigo-500 w-1/5 -ml-[100%] transition-all duration-1000"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-slate-600 dark:text-slate-400"> <span>Penyusunan Respon CRM</span> <span className="text-green-600 dark:text-green-400">65% Lebih Cepat</span> </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="bg-slate-200 dark:bg-slate-600 w-full"></div>
                        <div className="bg-orange-500 dark:bg-orange-400 w-[35%] -ml-[100%] transition-all duration-1000"></div>
                      </div>
                    </div>
                  </div>
               </div>
               <div className="bg-indigo-900 dark:bg-indigo-950/40 text-white p-8 rounded-3xl shadow-xl dark:shadow-none border border-transparent dark:border-slate-800 flex flex-col justify-center transition-all duration-300">
                  <h3 className="text-orange-400 font-black text-xs uppercase tracking-widest mb-2 italic">Research Highlight</h3>
                  <p className="text-sm leading-relaxed">
                    "Integrasi Generative AI pada sistem ECM Bank Panin terbukti mempercepat akses informasi krusial, yang secara langsung meningkatkan kualitas dan kecepatan interaksi pada sistem CRM."
                  </p>
                  <div className="mt-6 flex gap-3">
                    <span className="text-[9px] font-bold px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full">#FinTech</span>
                    <span className="text-[9px] font-bold px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full">#GenAI</span>
                    <span className="text-[9px] font-bold px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full">#ECM</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Tab Content: Smart ECM */}
        {activeTab === 'ecm' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-3 transition-all duration-300">
                <Search size={20} className="text-slate-300 dark:text-slate-500 ml-2" />
                <input 
                  type="text" 
                  placeholder="contoh: 'Cari kebijakan bunga KPR terbaru'" 
                  className="flex-1 bg-transparent py-3 text-sm outline-none font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" 
                  value={ecmSearch} 
                  onChange={e => setEcmSearch(e.target.value)} 
                />
                <button className="bg-indigo-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black tracking-widest hover:bg-black dark:hover:bg-indigo-700 transition shadow-lg dark:shadow-none">SEARCH</button>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                  <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest">Repository Digital</h3>
                  <Filter size={16} className="text-slate-300 dark:text-slate-500" />
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {ECM_DOCUMENTS.map(doc => (
                    <div 
                      key={doc.id} 
                      onClick={() => handleEcmSummarize(doc)} 
                      className={`p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition group ${selectedDoc?.id === doc.id ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:bg-white dark:group-hover:bg-slate-600 border border-transparent group-hover:border-indigo-100 dark:group-hover:border-slate-700 transition"><FileText size={20} /></div>
                        <div> 
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{doc.title}</p> 
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 tracking-tighter">{doc.type} • {doc.size} • {doc.date}</p> 
                        </div>
                      </div>
                      <ChevronRight size={18} className={`transition ${selectedDoc?.id === doc.id ? 'text-indigo-600 dark:text-indigo-400 translate-x-1' : 'text-slate-200 dark:text-slate-700'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* AI Summary Sidebar */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300">
              <div className="p-6 bg-indigo-950 dark:bg-slate-900 text-white flex items-center gap-3 transition-colors duration-300">
                <Sparkles size={20} className="text-orange-400" />
                <h3 className="font-black text-xs uppercase tracking-widest">AI Smart Summary</h3>
              </div>
              <div className="p-8 flex-1">
                {!selectedDoc ? (
                  <div className="text-center py-20 text-slate-300 dark:text-slate-500">
                    <Info size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-xs font-bold uppercase tracking-widest">Pilih dokumen untuk merangkum dengan AI</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Menganalisis:</p>
                      <p className="font-bold text-xs text-indigo-950 dark:text-white leading-tight">{selectedDoc.title}</p>
                    </div>
                    {isSummarizing ? (
                      <div className="flex flex-col items-center py-10 gap-3">
                        <Loader2 className="animate-spin text-orange-500" size={32} />
                        <p className="text-[10px] font-black uppercase text-indigo-900 dark:text-indigo-400 animate-pulse tracking-widest">Gen-AI Processing...</p>
                      </div>
                    ) : (
                      <div className="p-5 bg-indigo-50 dark:bg-slate-900/50 rounded-2xl border border-indigo-100 dark:border-indigo-950/50 text-sm italic leading-relaxed text-slate-700 dark:text-slate-300 shadow-inner transition-colors duration-300">
                        "{aiSummary}"
                      </div>
                    )}
                    <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Ekspor Hasil Analisis
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Arsip */}
        {activeTab === 'archive' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-indigo-900 dark:bg-slate-800 text-white p-10 rounded-3xl shadow-xl dark:shadow-none border border-transparent dark:border-slate-700 relative overflow-hidden transition-all duration-300">
               <div className="absolute right-[-20px] top-[-20px] opacity-10"><Database size={200} /></div>
               <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-3 uppercase tracking-tight">
                    <Sparkles size={28} className="text-white-400" /> Cari Arsip
                  </h2>
                  <div className="flex gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                    <input 
                      type="text" 
                      placeholder="Masukkan Nama Nasabah atau Nomor CIF" 
                      className="flex-1 bg-transparent px-4 py-2 text-white placeholder:text-indigo-200 dark:placeholder:text-slate-400 outline-none text-lg font-medium"
                      value={archiveSearch}
                      onChange={e => setArchiveSearch(e.target.value)}
                    />
                    <button 
                      onClick={handleArchiveSearch}
                      disabled={isArchiveSearching}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest transition flex items-center gap-2 shadow-lg shadow-orange-950/20"
                    >
                      {isArchiveSearching ? <Loader2 className="animate-spin" /> : "Cari"}
                    </button>
                  </div>
                  <p className="mt-4 text-[10px] font-bold text-indigo-300 dark:text-slate-400 uppercase tracking-widest">
                    AI Scan Engine: Mengakses Database ECM Bank Panin
                  </p>
               </div>
            </div>

            {archiveInsight && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-md dark:shadow-none border-l-8 border-l-orange-500 dark:border-slate-700 animate-in slide-in-from-left-4 duration-500 flex gap-6 items-start transition-colors duration-300">
                 <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-red-600 dark:text-orange-400 rounded-2xl shadow-sm"><Sparkles size={24}/></div>
                 <div>
                    <h3 className="text-red-600 dark:text-orange-500 font-black text-xs uppercase tracking-widest mb-2">Generative AI Insight</h3>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">"{archiveInsight}"</p>
                 </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[300px] transition-all duration-300">
              <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest">Data Historis Nasabah</h3>
                <span className="text-[10px] font-black bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase">Total: {foundArchives.length} Dokumen</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {foundArchives.length > 0 ? foundArchives.map(f => (
                  <div key={f.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-500 group-hover:text-indigo-600 dark:hover:text-indigo-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 group-hover:shadow-sm transition"> <FileText size={24} /> </div>
                      <div> 
                        <p className="font-black text-slate-800 dark:text-slate-200">{f.doc}</p> 
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                          Nasabah: <span className="text-slate-600 dark:text-slate-300">{f.name}</span> • Kategori: {f.cat} • CIF: {f.cif}
                        </p> 
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button className="p-2 text-slate-300 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"><Download size={20} /></button>
                       <ChevronRight size={20} className="text-slate-100 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    </div>
                  </div>
                )) : (
                  <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                       <Database size={32} className="text-slate-200 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-300 dark:text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Silakan masukkan kueri pencarian arsip</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Layanan Nasabah */}
        {activeTab === 'crm' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-500 h-[calc(100vh-250px)]">
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden transition-all duration-300">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 tracking-widest bg-slate-50/50 dark:bg-slate-900/20">Antrean Interaksi Nasabah</div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-5 bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 cursor-pointer shadow-inner">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">Andi Setiawan</p>
                    <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">Priority</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">"Saya mau tanya syarat KPR, apakah SHM saya sudah diproses?"</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden relative transition-all duration-300">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black text-lg shadow-inner">AS</div>
                  <div> 
                    <p className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase tracking-tight">Andi Setiawan</p> 
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p> 
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCrmAssist} disabled={isCrmGenerating} className="bg-indigo-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black dark:hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg dark:shadow-none">
                    {isCrmGenerating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} className="text-orange-400"/>} GEN-AI ASSIST
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30 dark:bg-slate-900/20 scroll-smooth">
                <div className="max-w-[80%] bg-white dark:bg-slate-700 p-5 rounded-3xl rounded-tl-none text-sm text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-600 leading-relaxed transition-all duration-300"> 
                  "Selamat siang, saya mau tanya syarat pengajuan KPR apa saja ya? Dan apakah sertifikat SHM yang saya kirim kemarin sudah terverifikasi di sistem?" 
                </div>

                {crmResponse && (
                  <div className="flex justify-end animate-in slide-in-from-right-4 duration-500">
                    <div className="max-w-[85%] bg-indigo-950 dark:bg-slate-900 text-white p-6 rounded-3xl rounded-tr-none shadow-2xl dark:shadow-none border border-transparent dark:border-slate-700 border-l-4 border-l-orange-500 dark:border-l-orange-500 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3 border-b border-white/10 dark:border-slate-700/50 pb-2">
                        <Sparkles size={14} className="text-orange-400"/>
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em]">Gen-AI Draft</p>
                      </div>
                      <p className="text-sm leading-relaxed italic text-indigo-50 dark:text-slate-300 font-medium">"{crmResponse}"</p>
                      <div className="mt-6 flex justify-end gap-3">
                        <button className="text-[9px] font-black px-4 py-2 bg-white/10 dark:bg-slate-800 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700 uppercase tracking-widest transition">Sempurnakan</button>
                        <button className="text-[9px] font-black px-4 py-2 bg-orange-500 rounded-xl hover:bg-orange-600 uppercase tracking-widest transition shadow-lg">Kirim Balasan</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-2xl transition-all duration-300">
                <div className="relative">
                  <textarea 
                    placeholder="Tulis pesan manual atau gunakan AI Assist..." 
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 pr-20 text-sm resize-none focus:ring-2 focus:ring-indigo-900 dark:focus:ring-indigo-400 transition-all outline-none h-24 shadow-inner dark:shadow-none font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" 
                    value={userChatInput} 
                    onChange={e => setUserChatInput(e.target.value)}
                  ></textarea>
                  <div className="absolute right-4 bottom-4 flex gap-2">
                    <button className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition"><Paperclip size={20}/></button>
                    <button className="w-12 h-12 bg-indigo-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-black dark:hover:bg-indigo-700 shadow-xl dark:shadow-none transition active:scale-90"><Send size={20}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;