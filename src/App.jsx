import { useState, useEffect } from 'react';
import {
  Search, FileText, Send, Sparkles, MessageSquare, Clock,
  User, Layout, ChevronRight, Loader2, Database, Info, Filter, Mail,
  Download, BarChart3, CheckCircle2, Lock,
  Eye, EyeOff, Paperclip, Sun, Moon, Menu, X, Plus, Trash2, Printer, ArrowLeft,
  Upload, Edit2, RotateCcw, Copy, Check, AlertTriangle, ShieldAlert
} from 'lucide-react';
import * as XLSX from 'xlsx';

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

// Database Master Klasifikasi (Lookup) untuk Auto-fill Form
const CLASSIFICATION_MASTER = [
  { code: 'AK 99.01', title: 'Laporan Neraca', defaultJra: 5 },
  { code: 'JB 99.04', title: 'Translog', defaultJra: 10 },
  { code: 'JB 99.01', title: 'Maintenance Report', defaultJra: 5 },
  { code: 'JB 99.16', title: 'Laporan Deposito', defaultJra: 5 },
  { code: 'JB 99.12', title: 'Daftar Suku Bunga Deposito', defaultJra: 5 },
  { code: 'TR 99.01', title: 'Bloter Valas', defaultJra: 5 },
  { code: 'JB 99.13', title: 'Daftar Hitam Nasabah', defaultJra: 5 },
  { code: 'TR 11.02', title: 'Receipt Form', defaultJra: 5 },
  { code: 'JB 99.07', title: 'Laporan Pengisian ATM', defaultJra: 5 },
  { code: 'JB 99.08 (SKN)', codeActual: 'JB 99.08', title: 'SKN', defaultJra: 5 },
  { code: 'JB 99.08 (RTGS)', codeActual: 'JB 99.08', title: 'RTGS', defaultJra: 5 },
  { code: 'JB 10.01', title: 'Kliring', defaultJra: 5 },
  { code: 'JB 12.00', title: 'Payment Point', defaultJra: 5 },
  { code: 'JB 20.02 (ATM)', codeActual: 'JB 20.02', title: 'ATM', defaultJra: 5 },
  { code: 'JB 20.02 (LOG)', codeActual: 'JB 20.02', title: 'LOG PENGGUNAAN KUNCI ATM', defaultJra: 5 },
  { code: 'JB 10.14 (PINBUK)', codeActual: 'JB 10.14', title: 'TITIPAN PINBUK', defaultJra: 5 },
  { code: 'JB 10.14 (KLIRING)', codeActual: 'JB 10.14', title: 'TITIPAN KLIRING', defaultJra: 5 },
  { code: 'JB 10.14 (KLR)', codeActual: 'JB 10.14', title: 'KLIRING', defaultJra: 5 },
  { code: 'AK 03.01 (TESKEY)', codeActual: 'AK 03.01', title: 'TESKEY', defaultJra: 5 },
  { code: 'AK 03.01 (SKN)', codeActual: 'AK 03.01', title: 'SKN', defaultJra: 5 },
  { code: 'AK 03.01 (BI FAST)', codeActual: 'AK 03.01', title: 'BI FAST', defaultJra: 5 },
];

// Database Master Cabang Panin Bank Daerah Bandung
const BANDUNG_BRANCHES = [
  { name: 'Setiabudi', code: 'BAN/BSE' },
  { name: 'Dago', code: 'BAN/DGO' },
  { name: 'Abdurahman Saleh', code: 'BAN/ABS' },
  { name: 'Surya Sumantri / Sutri', code: 'BAN/STI' },
  { name: 'Gardujati', code: 'BAN/GDJ' },
  { name: 'Andir', code: 'BAN/ADR' },
  { name: 'Festival Citylink / Felink', code: 'BAN/FCL' },
  { name: 'Otista', code: 'BAN/OTS' },
  { name: 'Banceuy', code: 'BAN/BCY' },
  { name: 'Asia Afrika', code: 'BAN/ASA' },
  { name: 'Buah Batu', code: 'BAN/BBT' },
  { name: 'Taman Kopo Indah', code: 'BAN/TKI' },
  { name: 'Kopo Mas', code: 'BAN/KMS' },
];

// Seed data awal dari gambar Excel yang dikirimkan user
const INITIAL_PHYSICAL_ARCHIVES = [
  { id: 1, classificationCode: 'AK 99.01', title: 'Laporan Neraca', startDate: '2020-01-05', endDate: '2020-08-20', jra: 5, destructionYear: 2025, mediaNumber: 1, boxNumber: '1', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 2, classificationCode: 'AK 99.01', title: 'Laporan Neraca', startDate: '2020-09-01', endDate: '2020-11-30', jra: 5, destructionYear: 2025, mediaNumber: 2, boxNumber: '1', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 3, classificationCode: 'AK 99.01', title: 'Laporan Neraca', startDate: '2020-12-02', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 3, boxNumber: '1', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 4, classificationCode: 'JB 99.04', title: 'Translog', startDate: '2020-01-05', endDate: '2020-03-30', jra: 10, destructionYear: 2030, mediaNumber: 1, boxNumber: '2', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 5, classificationCode: 'JB 99.04', title: 'Translog', startDate: '2020-04-01', endDate: '2020-07-30', jra: 10, destructionYear: 2030, mediaNumber: 2, boxNumber: '2', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 6, classificationCode: 'JB 99.04', title: 'Translog', startDate: '2020-08-01', endDate: '2020-12-30', jra: 10, destructionYear: 2030, mediaNumber: 3, boxNumber: '2', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 7, classificationCode: 'JB 99.01', title: 'Maintenance Report', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 1, boxNumber: '3', jenisArsip: 'Copy', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 8, classificationCode: 'JB 99.16', title: 'Laporan Deposito', startDate: '2020-01-05', endDate: '2020-04-29', jra: 5, destructionYear: 2025, mediaNumber: 2, boxNumber: '3', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 9, classificationCode: 'JB 99.16', title: 'Laporan Deposito', startDate: '2020-05-01', endDate: '2020-09-30', jra: 5, destructionYear: 2025, mediaNumber: 3, boxNumber: '3', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 10, classificationCode: 'JB 99.16', title: 'Laporan Deposito', startDate: '2020-10-01', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 4, boxNumber: '3', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 11, classificationCode: 'JB 99.12', title: 'Daftar Suku Bunga Deposito', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 5, boxNumber: '3', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 12, classificationCode: 'TR 99.01', title: 'Bloter Valas', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 1, boxNumber: '4', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 13, classificationCode: 'JB 99.13', title: 'Daftar Hitam Nasabah', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 2, boxNumber: '4', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 14, classificationCode: 'TR 11.02', title: 'Receipt Form', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 3, boxNumber: '4', jenisArsip: 'Copy', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 15, classificationCode: 'JB 99.07', title: 'Laporan Pengisian ATM', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 4, boxNumber: '4', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 16, classificationCode: 'JB 99.08', title: 'SKN', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 1, boxNumber: '5', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 17, classificationCode: 'JB 99.08', title: 'RTGS', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 2, boxNumber: '5', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 18, classificationCode: 'JB 10.01', title: 'Kliring', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 3, boxNumber: '5', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
  { id: 19, classificationCode: 'JB 12.00', title: 'Payment Point', startDate: '2020-01-05', endDate: '2020-12-30', jra: 5, destructionYear: 2025, mediaNumber: 4, boxNumber: '5', jenisArsip: 'Asli', unitKerja: 'IT 06.01', kategoriUnit: 'BAN/BSE' },
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

  // --- STATE & LISTENER UNTUK STICKY HEADER MENGECEK SCROLL ---
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // --- STATE AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('current_user'));
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- STATE BARU AUTH (REGISTER & LUPA PASSWORD) ---
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [forgotInput, setForgotInput] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [currentUser]);

  // --- STATE NAVIGASI & MOBILE DRAWER ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE ARSIP SUB-TAB (Nasabah vs Dus Fisik) ---
  const [archiveSubTab, setArchiveSubTab] = useState('nasabah'); // 'nasabah' atau 'fisik'

  // --- STATE DATABASE ARSIP FISIK ---
  const [physicalArchives, setPhysicalArchives] = useState(() => {
    const saved = localStorage.getItem('physical_archives');
    return saved ? JSON.parse(saved) : INITIAL_PHYSICAL_ARCHIVES;
  });

  useEffect(() => {
    localStorage.setItem('physical_archives', JSON.stringify(physicalArchives));
  }, [physicalArchives]);

  // --- STATE FORM INPUT ARSIP FISIK ---
  const [editingItem, setEditingItem] = useState(null);
  const [newClassification, setNewClassification] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newJra, setNewJra] = useState('5');
  const [newMediaNumber, setNewMediaNumber] = useState('');
  const [newBoxNumber, setNewBoxNumber] = useState('');
  const [newUnitCategory, setNewUnitCategory] = useState('BAN/BSE');
  const [classMode, setClassMode] = useState('select'); // 'select' atau 'manual'
  const [selectedPreset, setSelectedPreset] = useState('');
  const [newDestructionYear, setNewDestructionYear] = useState('');

  // Auto-hitung tahun musnah di form input
  useEffect(() => {
    if (newEndDate && newJra) {
      const parts = newEndDate.split('-');
      const year = parseInt(parts[0], 10);
      if (!isNaN(year)) {
        setNewDestructionYear(year + parseInt(newJra, 10));
      }
    } else {
      setNewDestructionYear('');
    }
  }, [newEndDate, newJra]);

  // --- STATE FILTER & SELECTION ARSIP FISIK ---
  const [filterBoxNumber, setFilterBoxNumber] = useState('');
  const [searchPhysicalQuery, setSearchPhysicalQuery] = useState('');
  const [printBoxNumber, setPrintBoxNumber] = useState(null); // Menyimpan no kotak yang akan dicetak
  const [sortField, setSortField] = useState('destructionYear');
  const [sortOrder, setSortOrder] = useState('desc');
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  // --- STATE SMART ECM ---
  const [ecmSearch, setEcmSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [ecmDocuments, setEcmDocuments] = useState(() => {
    const saved = localStorage.getItem('ecm_documents');
    return saved ? JSON.parse(saved) : ECM_DOCUMENTS;
  });

  useEffect(() => {
    localStorage.setItem('ecm_documents', JSON.stringify(ecmDocuments));
  }, [ecmDocuments]);

  // --- STATE DASHBOARD KP OTOMATISASI PELABELAN ---
  const [aiLabelInput, setAiLabelInput] = useState('');
  const [aiLabelResult, setAiLabelResult] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState('');

  // --- STATE ARSIP STAF ---
  const [archiveSearch, setArchiveSearch] = useState('');
  const [foundArchives, setFoundArchives] = useState([]);
  const [isArchiveSearching, setIsArchiveSearching] = useState(false);
  const [archiveInsight, setArchiveInsight] = useState('');
  const [selectedScanDoc, setSelectedScanDoc] = useState(null);
  const [isScanningDoc, setIsScanningDoc] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [customerArchives, setCustomerArchives] = useState(() => {
    const saved = localStorage.getItem('customer_archives');
    return saved ? JSON.parse(saved) : CUSTOMER_ARCHIVES;
  });

  useEffect(() => {
    localStorage.setItem('customer_archives', JSON.stringify(customerArchives));
  }, [customerArchives]);

  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [addDocName, setAddDocName] = useState('');
  const [addDocCif, setAddDocCif] = useState('');
  const [addDocFilename, setAddDocFilename] = useState('');
  const [addDocCategory, setAddDocCategory] = useState('Identitas');
  const [addDocCustomCategory, setAddDocCustomCategory] = useState('');
  const [addDocSize, setAddDocSize] = useState('');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- STATE CRM ---
  const [isCrmGenerating, setIsCrmGenerating] = useState(false);
  const [crmResponse, setCrmResponse] = useState('');
  const [userChatInput, setUserChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'customer', text: "Selamat siang, saya mau tanya syarat pengajuan KPR apa saja ya? Dan apakah sertifikat SHM yang saya kirim kemarin sudah terverifikasi di sistem?" }
  ]);

  // --- HANDLERS ---
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleEcmUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    let type = 'Umum';
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') type = 'Regulasi';
    else if (ext === 'docx' || ext === 'doc') type = 'SOP';
    else if (ext === 'xlsx' || ext === 'xls') type = 'Data';
    else if (['png', 'jpg', 'jpeg', 'svg'].includes(ext)) type = 'Gambar';

    const newDoc = {
      id: ecmDocuments.length > 0 ? Math.max(...ecmDocuments.map(d => d.id)) + 1 : 1,
      title: file.name,
      type: type,
      size: sizeFormatted,
      date: new Date().toISOString().split('T')[0]
    };

    setEcmDocuments([newDoc, ...ecmDocuments]);
    alert(`Berkas "${file.name}" berhasil ditambahkan ke repository digital!`);
    e.target.value = ''; // Reset file input
  };

  const handleSendMessage = (textToSend = null) => {
    const msgText = textToSend !== null ? textToSend : userChatInput;
    if (!msgText.trim()) return;

    const newMsg = {
      id: chatMessages.length > 0 ? Math.max(...chatMessages.map(m => m.id)) + 1 : 1,
      sender: 'user',
      text: msgText
    };

    setChatMessages(prev => [...prev, newMsg]);
    if (textToSend === null) {
      setUserChatInput('');
    }
  };

  const handleCrmRefine = () => {
    if (!crmResponse) return;
    setUserChatInput(crmResponse);
    setCrmResponse('');
  };

  const handleCrmSendReply = () => {
    if (!crmResponse) return;
    handleSendMessage(crmResponse);
    setCrmResponse('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!employeeId || !password) {
      return setLoginError('ID Karyawan dan kata sandi wajib diisi.');
    }
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      const response = await fetch('http://127.0.0.1:5005/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeId, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal login.');
      }

      setCurrentUser(data.user);
      setIsLoggedIn(true);
      setToastMessage(`Selamat datang kembali, ${data.user.fullName}!`);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEmployeeId || !regFullName || !regEmail || !regPassword) {
      return setRegError('Harap lengkapi semua kolom pendaftaran.');
    }
    setIsRegistering(true);
    setRegError('');
    setRegSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:5005/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeId: regEmployeeId,
          fullName: regFullName,
          email: regEmail,
          password: regPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal registrasi.');
      }

      setRegSuccess(data.message);
      setRegEmployeeId('');
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
      setEmployeeId(data.user.employeeId);
      
      setTimeout(() => {
        setAuthMode('login');
        setRegSuccess('');
      }, 3000);
    } catch (error) {
      setRegError(error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotInput) {
      return setForgotError('Harap isi ID Karyawan atau Email perusahaan Anda.');
    }
    setIsSendingForgot(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:5005/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeIdOrEmail: forgotInput })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses lupa password.');
      }

      setForgotSuccess(data.message);
      setForgotInput('');
    } catch (error) {
      setForgotError(error.message);
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleClassifyDocument = async (e) => {
    if (e) e.preventDefault();
    if (!aiLabelInput.trim()) return;

    setIsClassifying(true);
    setClassifyError('');
    setAiLabelResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5005/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentTitle: aiLabelInput
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memanggil backend');
      }

      const data = await response.json();
      setAiLabelResult(data);
      setIsClassifying(false);
    } catch (error) {
      console.warn('Backend server offline or Gemini API error. Using local matching fallback.', error);
      
      // Fallback matching logic using CLASSIFICATION_MASTER
      setTimeout(() => {
        const queryNorm = aiLabelInput.toLowerCase().replace(/\s+/g, '');
        let matched = CLASSIFICATION_MASTER.find(c => {
          const titleNorm = c.title.toLowerCase().replace(/\s+/g, '');
          const codeNorm = c.code.toLowerCase().replace(/\s+/g, '');
          return queryNorm.includes(titleNorm) || titleNorm.includes(queryNorm) || queryNorm.includes(codeNorm);
        });

        if (matched) {
          setAiLabelResult({
            classificationCode: matched.codeActual || matched.code,
            jra: matched.defaultJra || 5,
            title: matched.title
          });
        } else {
          setAiLabelResult({
            classificationCode: 'JB 99.99',
            jra: 5,
            title: aiLabelInput.charAt(0).toUpperCase() + aiLabelInput.slice(1)
          });
        }
        setIsClassifying(false);
      }, 1200);
    }
  };

  const handleUseClassification = (result) => {
    if (!result) return;
    setNewClassification(result.classificationCode);
    setNewTitle(result.title);
    setNewJra(String(result.jra));
    setClassMode('manual');
    setActiveTab('archive');
    setArchiveSubTab('fisik');
    setToastMessage('Data hasil AI disalin ke form arsip fisik!');
  };

  const handleDirectPrintBox = (boxNum) => {
    setPrintBoxNumber(boxNum);
    setActiveTab('archive');
    setArchiveSubTab('fisik');
    // Scroll ke bagian print box jika diperlukan
    setTimeout(() => {
      const el = document.getElementById('print-label-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleEcmSummarize = async (doc) => {
    setSelectedDoc(doc);
    setIsSummarizing(true);
    setAiSummary('');
    
    try {
      const response = await fetch('http://127.0.0.1:5005/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentTitle: doc.title,
          documentType: doc.type
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memanggil backend');
      }

      const data = await response.json();
      setAiSummary(data.summary);
      setIsSummarizing(false);
    } catch (error) {
      console.warn('Backend server offline or Gemini API error. Using mockup fallback.', error);
      setTimeout(() => {
        setAiSummary(`[Simulasi AI - Backend Offline/API Key Kosong]\nBerdasarkan analisis AI terhadap dokumen "${doc.title}", poin pentingnya adalah:\n1. Suku bunga KPR disesuaikan menjadi 5.5% fixed 3 tahun.\n2. Semua kelengkapan dokumen jaminan/agunan wajib diverifikasi keasliannya oleh tim hukum.\n3. Proses SLA pemrosesan dipercepat hingga maksimal 3 hari kerja.`);
        setIsSummarizing(false);
      }, 1500);
    }
  };

  const handleArchiveSearch = () => {
    if (!archiveSearch) return;
    setIsArchiveSearching(true);
    setFoundArchives([]);
    setArchiveInsight('');
    setSelectedScanDoc(null);
    setScanResult(null);
    setTimeout(() => {
      const results = customerArchives.filter(d =>
        d.name.toLowerCase().includes(archiveSearch.toLowerCase()) ||
        d.cif.toLowerCase().includes(archiveSearch.toLowerCase())
      );
      setFoundArchives(results);
      if (results.length > 0) {
        setArchiveInsight(`AI Insight: Nasabah atas nama ${archiveSearch} memiliki profil risiko rendah. Dokumen agunan SHM terdeteksi valid. AI merekomendasikan verifikasi ulang untuk dokumen KTP yang akan kadaluarsa dalam 6 bulan.`);
      }
      setIsArchiveSearching(false);
    }, 1500);
  };

  const handleCustomerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddDocFilename(file.name);
      
      let sizeStr = '';
      if (file.size > 1024 * 1024) {
        sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      } else {
        sizeStr = (file.size / 1024).toFixed(0) + ' KB';
      }
      setAddDocSize(sizeStr);
    }
  };

  const handleAddCustomerDoc = (e) => {
    e.preventDefault();
    if (!addDocName || !addDocCif || !addDocFilename) {
      setToastMessage('Harap lengkapi semua kolom!');
      return;
    }
    
    const finalCategory = addDocCategory === 'Lainnya' ? addDocCustomCategory.trim() : addDocCategory;
    if (addDocCategory === 'Lainnya' && !addDocCustomCategory) {
      setToastMessage('Harap tentukan kategori kustom!');
      return;
    }

    const newDoc = {
      id: Date.now(),
      name: addDocName.trim(),
      doc: addDocFilename.trim(),
      cat: finalCategory,
      cif: addDocCif.trim().toUpperCase(),
      size: addDocSize || '350 KB'
    };
    
    const updated = [...customerArchives, newDoc];
    setCustomerArchives(updated);
    setToastMessage(`Dokumen "${addDocFilename}" berhasil ditambahkan!`);
    
    // Reset Form
    setAddDocName('');
    setAddDocCif('');
    setAddDocFilename('');
    setAddDocCategory('Identitas');
    setAddDocCustomCategory('');
    setAddDocSize('');
    setIsAddDocOpen(false);

    // Update real-time search results if they match the query
    if (archiveSearch) {
      const isMatch = newDoc.name.toLowerCase().includes(archiveSearch.toLowerCase()) ||
                      newDoc.cif.toLowerCase().includes(archiveSearch.toLowerCase());
      if (isMatch) {
        setFoundArchives(prev => [...prev, newDoc]);
      }
    }
  };

  const handleEcmDocScan = (doc) => {
    setSelectedScanDoc(doc);
    setIsScanningDoc(true);
    setScanResult(null);
    setTimeout(() => {
      let result = null;
      if (doc.id === 101) {
        result = {
          status: 'Warning',
          risk: 'Medium Risk',
          riskColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
          statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
          checklist: [
            { label: 'Keterbacaan OCR Teks', status: 'PASS', details: 'Akurasi pembacaan 98%' },
            { label: 'Kesesuaian NIK (Dukcapil)', status: 'PASS', details: 'Terdaftar aktif' },
            { label: 'Kecocokan Wajah vs Foto KTP', status: 'PASS', details: 'Tingkat kemiripan 92%' },
            { label: 'Kesesuaian Tanda Tangan', status: 'PASS', details: 'Sesuai dengan spesimen kartu tanda tangan' },
            { label: 'Masa Berlaku Dokumen', status: 'WARNING', details: 'Akan berakhir dalam 6 bulan (Desember 2026)' },
          ],
          recommendation: 'KTP terverifikasi dengan database Dukcapil. Namun, dokumen ini akan kadaluarsa dalam 6 bulan. Direkomendasikan melakukan pembaruan dokumen saat nasabah bertransaksi di kantor cabang terdekat atau melalui pembaruan profil digital.'
        };
      } else if (doc.id === 102) {
        result = {
          status: 'Valid',
          risk: 'Low Risk',
          riskColor: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900',
          statusColor: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400',
          checklist: [
            { label: 'Verifikasi Database BPN', status: 'PASS', details: 'Sertifikat terdaftar resmi di BPN' },
            { label: 'Keaslian Tanda Tangan & Cap', status: 'PASS', details: 'Tervalidasi secara digital' },
            { label: 'Kesesuaian Lokasi Agunan', status: 'PASS', details: 'Setiabudi, Bandung (Sesuai form pengajuan)' },
            { label: 'Kesesuaian Nama Pemilik', status: 'PASS', details: 'Nama pemilik cocok dengan Andi Setiawan' },
            { label: 'Status Bebas Sengketa', status: 'PASS', details: 'Tidak ada catatan sengketa atau sita jaminan' },
          ],
          recommendation: 'Sertifikat Hak Milik (SHM) No. 442 atas nama Andi Setiawan telah diverifikasi valid oleh Badan Pertanahan Nasional (BPN). Agunan dan kepemilikan sah untuk proses kredit.'
        };
      } else if (doc.id === 103) {
        result = {
          status: 'Valid',
          risk: 'Low Risk',
          riskColor: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900',
          statusColor: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400',
          checklist: [
            { label: 'Kelengkapan Formulir', status: 'PASS', details: 'Seluruh field wajib terisi penuh' },
            { label: 'Verifikasi Tanda Tangan', status: 'PASS', details: 'Cocok dengan spesimen tanda tangan' },
            { label: 'Validasi CIF Nasabah', status: 'PASS', details: 'CIF aktif (CIF88273)' },
            { label: 'Screening KYC & AML', status: 'PASS', details: 'Bebas dari daftar PEP & Sanctions list' },
          ],
          recommendation: 'Formulir pembukaan rekening lengkap dan valid. Hasil screening KYC & AML menunjukkan profil risiko pencucian uang sangat rendah.'
        };
      } else if (doc.id === 104) {
        result = {
          status: 'Warning',
          risk: 'Medium Risk',
          riskColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
          statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
          checklist: [
            { label: 'Verifikasi Instansi / Pemberi Kerja', status: 'PASS', details: 'PT Maju Mundur Tbk (Aktif)' },
            { label: 'Validasi Perhitungan Matematis', status: 'PASS', details: 'Kalkulasi pajak dan potongan tepat' },
            { label: 'Kejelasan Cap & Tanda Tangan', status: 'WARNING', details: 'Tanda tangan ada, namun stempel perusahaan agak buram' },
            { label: 'Kesesuaian Mutasi Rekening', status: 'PASS', details: 'Kredit gaji bulanan sesuai dengan slip' },
          ],
          recommendation: 'Slip gaji valid secara perhitungan dan sesuai dengan mutasi rekening. Namun, stempel perusahaan terdeteksi sedikit buram. Disarankan untuk membandingkan dengan SPT Tahunan atau rekening koran 3 bulan terakhir.'
        };
      } else {
        result = {
          status: 'Valid',
          risk: 'Low Risk',
          riskColor: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900',
          statusColor: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400',
          checklist: [
            { label: 'Integritas Berkas File', status: 'PASS', details: `Format berkas terbaca dengan sempurna (${doc.size || '350 KB'})` },
            { label: 'Pembacaan Metadata File', status: 'PASS', details: 'Informasi pengunggah dan tanggal terekam' },
            { label: 'Kesesuaian Kategori Dokumen', status: 'PASS', details: `Kategori otomatis sesuai dengan: ${doc.cat || 'Umum'}` },
            { label: 'Deteksi Virus / Malware', status: 'PASS', details: 'Berkas bersih dan aman' },
          ],
          recommendation: `Dokumen "${doc.doc || doc.title || 'Dokumen'}" telah discan secara aman oleh AI Engine. Semua data struktural terbaca dengan baik dan tidak ditemukan tanda-tanda manipulasi dokumen.`
        };
      }
      setScanResult(result);
      setIsScanningDoc(false);
    }, 1200);
  };

  const handleCrmAssist = async () => {
    setIsCrmGenerating(true);
    setCrmResponse('');

    try {
      const response = await fetch('http://127.0.0.1:5005/api/crm-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: 'Andi Setiawan',
          customerCif: 'CIF99201',
          customerMessage: 'Selamat siang, saya mau tanya syarat pengajuan KPR apa saja ya? Dan apakah sertifikat SHM yang saya kirim kemarin sudah terverifikasi di sistem?'
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memanggil backend');
      }

      const data = await response.json();
      setCrmResponse(data.response);
      setIsCrmGenerating(false);
    } catch (error) {
      console.warn('Backend server offline or Gemini API error. Using mockup fallback.', error);
      setTimeout(() => {
        setCrmResponse("[Simulasi AI - Backend Offline/API Key Kosong]\nHalo Bapak Andi Setiawan, terima kasih telah menghubungi Bank Panin. Berdasarkan pengecekan sistem kami terhadap dokumen KPR Anda di ECM, permohonan Anda sudah dalam tahap verifikasi agunan. Promo bunga 5.5% tetap berlaku untuk Anda. Apakah ada dokumen lain yang ingin Anda tanyakan?");
        setIsCrmGenerating(false);
      }, 1500);
    }
  };

  // --- HELPERS & HANDLERS FOR EXCEL IMPORT & AUTO-CLEANING ---
  const parseExcelDate = (val) => {
    if (!val) return '';
    
    if (val instanceof Date) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const str = String(val).trim();
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    
    const parts = str.split(/[/-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    return '';
  };

  const cleanImportedData = (row, nextId) => {
    const cleanKeys = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
      cleanKeys[normalizedKey] = row[key];
    });

    let classificationCode = cleanKeys['kodeklasifikasi'] || cleanKeys['klasifikasi'] || cleanKeys['kode'] || cleanKeys['classificationcode'] || '';
    classificationCode = String(classificationCode).trim().toUpperCase();

    let title = cleanKeys['masalah'] || cleanKeys['judul'] || cleanKeys['judularsip'] || cleanKeys['namadokumen'] || cleanKeys['title'] || '';
    title = String(title).trim();

    let startDate = cleanKeys['tanggalawal'] || cleanKeys['tglawal'] || cleanKeys['mulai'] || cleanKeys['startdate'] || '';
    startDate = parseExcelDate(startDate);

    let endDate = cleanKeys['tanggalakhir'] || cleanKeys['tglakhir'] || cleanKeys['selesai'] || cleanKeys['enddate'] || '';
    endDate = parseExcelDate(endDate);

    let jraRaw = cleanKeys['jra'] || cleanKeys['retensi'] || cleanKeys['jangkawaktu'] || '';
    let jra = 5;
    if (jraRaw !== '') {
      const parsedJra = parseInt(String(jraRaw).replace(/\D/g, ''), 10);
      if (!isNaN(parsedJra)) {
        jra = parsedJra;
      }
    } else {
      const preset = CLASSIFICATION_MASTER.find(c => {
        const codeNorm = c.code.toUpperCase().replace(/\s+/g, '');
        const targetNorm = classificationCode.replace(/\s+/g, '');
        return codeNorm.includes(targetNorm) || targetNorm.includes(codeNorm);
      });
      if (preset) {
        jra = preset.defaultJra;
      }
    }

    let destructionYearRaw = cleanKeys['tahunmusnah'] || cleanKeys['musnah'] || cleanKeys['destructionyear'] || '';
    let destructionYear = 0;
    if (destructionYearRaw !== '') {
      const parsedDY = parseInt(String(destructionYearRaw).replace(/\D/g, ''), 10);
      if (!isNaN(parsedDY)) {
        destructionYear = parsedDY;
      }
    }
    if (!destructionYear && endDate) {
      const year = parseInt(endDate.split('-')[0], 10);
      if (!isNaN(year)) {
        destructionYear = year + jra;
      }
    }

    let mediaNumberRaw = cleanKeys['nomediasimpan'] || cleanKeys['nomedia'] || cleanKeys['media'] || cleanKeys['medianumber'] || '';
    let mediaNumber = 1;
    if (mediaNumberRaw !== '') {
      const parsedMN = parseInt(String(mediaNumberRaw).replace(/\D/g, ''), 10);
      if (!isNaN(parsedMN)) {
        mediaNumber = parsedMN;
      }
    }

    let boxNumberRaw = cleanKeys['nokotak'] || cleanKeys['nobox'] || cleanKeys['kotak'] || cleanKeys['box'] || cleanKeys['boxnumber'] || '';
    let boxNumber = String(boxNumberRaw).trim();
    if (!boxNumber) boxNumber = '1';

    let jenisArsip = cleanKeys['jenisarsip'] || cleanKeys['jenis'] || cleanKeys['status'] || cleanKeys['jenis_arsip'] || 'Asli';
    jenisArsip = String(jenisArsip).trim();
    if (jenisArsip.toLowerCase() === 'asli') jenisArsip = 'Asli';
    else if (jenisArsip.toLowerCase() === 'copy') jenisArsip = 'Copy';
    else if (jenisArsip.toLowerCase() === 'penting') jenisArsip = 'Penting';
    else jenisArsip = 'Asli';

    let cabangRaw = cleanKeys['cabang'] || cleanKeys['kodecabang'] || cleanKeys['kategoriunit'] || cleanKeys['unit'] || cleanKeys['branch'] || '';
    cabangRaw = String(cabangRaw).trim().toLowerCase();
    
    let kategoriUnit = 'BAN/BSE';
    if (cabangRaw) {
      const matchedBranch = BANDUNG_BRANCHES.find(b => {
        const nameNorm = b.name.toLowerCase();
        const codeNorm = b.code.toLowerCase();
        return nameNorm.includes(cabangRaw) || 
               cabangRaw.includes(nameNorm) || 
               codeNorm.includes(cabangRaw) || 
               cabangRaw.includes(codeNorm);
      });
      if (matchedBranch) {
        kategoriUnit = matchedBranch.code;
      }
    }

    if (!classificationCode && title) {
      const preset = CLASSIFICATION_MASTER.find(c => {
        const titleNorm = c.title.toLowerCase().replace(/\s+/g, '');
        const targetTitleNorm = title.toLowerCase().replace(/\s+/g, '');
        return titleNorm.includes(targetTitleNorm) || targetTitleNorm.includes(titleNorm);
      });
      if (preset) {
        classificationCode = preset.codeActual || preset.code;
      }
    }

    if (!title && classificationCode) {
      const preset = CLASSIFICATION_MASTER.find(c => {
        const codeNorm = (c.codeActual || c.code).toUpperCase().replace(/\s+/g, '');
        const targetNorm = classificationCode.replace(/\s+/g, '');
        return codeNorm === targetNorm;
      });
      if (preset) {
        title = preset.title;
      } else {
        title = 'Arsip Klasifikasi ' + classificationCode;
      }
    }

    if (!classificationCode) classificationCode = 'LAIN-LAIN';
    if (!title) title = 'Dokumen Arsip Tanpa Judul';
    if (!endDate) {
      const today = new Date();
      endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (!destructionYear) {
        destructionYear = today.getFullYear() + jra;
      }
    }

    return {
      id: nextId,
      classificationCode,
      title,
      startDate,
      endDate,
      jra,
      destructionYear,
      mediaNumber,
      boxNumber,
      jenisArsip,
      kategoriUnit
    };
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (rawRows.length === 0) {
          alert('File Excel kosong atau tidak terbaca.');
          return;
        }

        let currentMaxId = physicalArchives.length > 0 ? Math.max(...physicalArchives.map(a => a.id)) : 0;
        const cleanedRows = rawRows.map((row, idx) => {
          return cleanImportedData(row, currentMaxId + idx + 1);
        });

        setPhysicalArchives(prev => [...cleanedRows, ...prev]);
        alert(`Berhasil mengimpor ${cleanedRows.length} data arsip fisik baru dari Excel! Data telah dibersihkan secara otomatis.`);
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat memproses file Excel. Pastikan format file benar.');
      }
      e.target.value = '';
    };

    reader.readAsArrayBuffer(file);
  };

  // --- HANDLER EDIT ARSIP FISIK ---
  const handleStartEdit = (item) => {
    setEditingItem(item);
    
    const matched = CLASSIFICATION_MASTER.find(c => (c.codeActual || c.code) === item.classificationCode);
    if (matched) {
      setClassMode('select');
      setSelectedPreset(matched.code);
      setClassSearchQuery(`${matched.code} - ${matched.title}`);
    } else {
      setClassMode('manual');
      setSelectedPreset('');
      setClassSearchQuery('');
    }

    setNewClassification(item.classificationCode);
    setNewTitle(item.title);
    setNewStartDate(item.startDate || '');
    setNewEndDate(item.endDate || '');
    setNewJra(String(item.jra));
    setNewMediaNumber(String(item.mediaNumber));
    setNewBoxNumber(String(item.boxNumber));
    setNewUnitCategory(item.kategoriUnit);
    
    // Scroll secara halus ke bagian form (berguna di HP)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewClassification('');
    setNewTitle('');
    setNewStartDate('');
    setNewEndDate('');
    setSelectedPreset('');
    setNewJra('5');
    setNewMediaNumber('');
    setNewBoxNumber('');
    setNewUnitCategory('BAN/BSE');
    setClassMode('select');
    setClassSearchQuery('');
    setIsClassDropdownOpen(false);
  };

  // --- HANDLER ARSIP FISIK BARU / UPDATE ---
  const handleAddPhysicalArchive = (e) => {
    e.preventDefault();
    if (!newClassification || !newTitle || !newEndDate || !newMediaNumber || !newBoxNumber) {
      alert('Harap lengkapi kolom bertanda bintang (*).');
      return;
    }

    const year = parseInt(newEndDate.split('-')[0], 10);
    const calculatedDestructionYear = year + parseInt(newJra, 10);

    if (editingItem) {
      // Mode Edit: Update item yang sudah ada
      const updatedArchives = physicalArchives.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            classificationCode: newClassification.toUpperCase(),
            title: newTitle,
            startDate: newStartDate,
            endDate: newEndDate,
            jra: parseInt(newJra, 10),
            destructionYear: calculatedDestructionYear,
            mediaNumber: parseInt(newMediaNumber, 10),
            boxNumber: String(newBoxNumber).trim(),
            jenisArsip: item.jenisArsip || 'Asli', // Pertahankan jenis arsip yang sudah ada
            kategoriUnit: newUnitCategory.toUpperCase()
          };
        }
        return item;
      });
      
      setPhysicalArchives(updatedArchives);
      handleCancelEdit();
      alert('Data arsip fisik berhasil diperbarui!');
    } else {
      // Mode Tambah Baru
      const newId = physicalArchives.length > 0 ? Math.max(...physicalArchives.map(a => a.id)) + 1 : 1;
      const newItem = {
        id: newId,
        classificationCode: newClassification.toUpperCase(),
        title: newTitle,
        startDate: newStartDate,
        endDate: newEndDate,
        jra: parseInt(newJra, 10),
        destructionYear: calculatedDestructionYear,
        mediaNumber: parseInt(newMediaNumber, 10),
        boxNumber: String(newBoxNumber).trim(),
        jenisArsip: 'Asli', // Default jenis arsip untuk data baru
        kategoriUnit: newUnitCategory.toUpperCase()
      };

      setPhysicalArchives([newItem, ...physicalArchives]);

      // Reset form
      setNewClassification('');
      setNewTitle('');
      setNewStartDate('');
      setNewEndDate('');
      setSelectedPreset('');
      setClassSearchQuery('');
      setIsClassDropdownOpen(false);
      setNewMediaNumber(prev => prev ? parseInt(prev, 10) + 1 : '');
    }
  };

  const handleDeletePhysicalArchive = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data arsip fisik ini?')) {
      setPhysicalArchives(physicalArchives.filter(item => item.id !== id));
      if (editingItem && editingItem.id === id) {
        handleCancelEdit();
      }
    }
  };

  // --- HANDLER RESET & EXPORT DATABASE ---
  const handleResetDatabase = () => {
    if (confirm('Apakah Anda yakin ingin mereset database ke data awal? Semua data baru yang Anda tambahkan atau edit akan digantikan oleh 19 data default.')) {
      setPhysicalArchives(INITIAL_PHYSICAL_ARCHIVES);
      handleCancelEdit();
      alert('Database berhasil di-reset ke data default.');
    }
  };

  const handleExcelExport = () => {
    if (physicalArchives.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    try {
      // Petakan data arsip ke kolom berlabel Bahasa Indonesia (tanpa Jenis Arsip)
      const exportData = physicalArchives.map((item, idx) => {
        const branch = BANDUNG_BRANCHES.find(b => b.code === item.kategoriUnit);
        const branchName = branch ? `${branch.name} (${branch.code})` : item.kategoriUnit;

        return {
          'No': idx + 1,
          'Kode Klasifikasi': item.classificationCode,
          'Masalah / Judul Arsip': item.title,
          'Tanggal Awal': item.startDate ? formatDateExcel(item.startDate) : '-',
          'Tanggal Akhir': item.endDate ? formatDateExcel(item.endDate) : '-',
          'JRA (Tahun)': item.jra,
          'Tahun Musnah': item.destructionYear,
          'No. Media Simpan': item.mediaNumber,
          'No. Kotak': item.boxNumber,
          'Cabang': branchName
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Database Arsip Fisik");

      XLSX.writeFile(workbook, "database_arsip_fisik.xlsx");
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengekspor database ke Excel.');
    }
  };

  // --- HELPER UNTUK MENDAPATKAN STATISTIK KOTAK DUS ARSIP ---
  const getBoxesSummary = () => {
    const boxesMap = {};
    physicalArchives.forEach(item => {
      if (!boxesMap[item.boxNumber]) {
        boxesMap[item.boxNumber] = {
          boxNumber: item.boxNumber,
          items: [],
          destructionYear: 0,
          classifications: new Set(),
          unitKerja: item.unitKerja,
          kategoriUnit: item.kategoriUnit
        };
      }
      boxesMap[item.boxNumber].items.push(item);
      boxesMap[item.boxNumber].classifications.add(item.classificationCode);
      if (item.destructionYear > boxesMap[item.boxNumber].destructionYear) {
        boxesMap[item.boxNumber].destructionYear = item.destructionYear;
      }
    });

    return Object.values(boxesMap).sort((a, b) => {
      const numA = parseInt(a.boxNumber, 10);
      const numB = parseInt(b.boxNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.boxNumber.localeCompare(b.boxNumber);
    });
  };

  // --- DATE FORMATTER INDONESIA UNTUK PRINT DIK ---
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '';
    const months = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // --- DATE FORMATTER EXCEL UNTUK TABEL DATABASE ---
  const formatDateExcel = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Sort handler helper
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort tabel fisik
  const filteredPhysicalArchives = [...physicalArchives]
    .filter(item => {
      const matchBox = filterBoxNumber ? item.boxNumber === filterBoxNumber : true;
      const matchQuery = searchPhysicalQuery ? (
        item.title.toLowerCase().includes(searchPhysicalQuery.toLowerCase()) ||
        item.classificationCode.toLowerCase().includes(searchPhysicalQuery.toLowerCase()) ||
        item.boxNumber.toLowerCase().includes(searchPhysicalQuery.toLowerCase())
      ) : true;
      return matchBox && matchQuery;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'title' || sortField === 'classificationCode') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (sortField === 'boxNumber') {
        const numA = parseInt(valA, 10);
        const numB = parseInt(valB, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }
        return sortOrder === 'asc' 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      }

      if (sortField === 'startDate' || sortField === 'endDate') {
        valA = valA || '';
        valB = valB || '';
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (sortField === 'jra' || sortField === 'mediaNumber' || sortField === 'destructionYear') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Filter presets klasifikasi untuk combobox pencarian
  const filteredPresets = CLASSIFICATION_MASTER.filter(c => {
    const query = (classSearchQuery || '').toLowerCase().trim();
    if (!query) return true;
    return c.code.toLowerCase().includes(query) || 
           c.title.toLowerCase().includes(query) ||
           `${c.code} - ${c.title}`.toLowerCase().includes(query);
  });

  // Filter ecm documents
  const filteredEcmDocuments = ecmDocuments.filter(doc =>
    doc.title.toLowerCase().includes(ecmSearch.toLowerCase()) ||
    doc.type.toLowerCase().includes(ecmSearch.toLowerCase())
  );

  // Ambil list item untuk kotak yang terpilih untuk diprint
  const itemsToPrint = physicalArchives.filter(item => item.boxNumber === printBoxNumber);

  // Pad tabel print agar pas 9 baris agar visualnya kokoh dan seragam seperti aslinya
  const paddedPrintRows = [...itemsToPrint];
  const maxPrintRowsCount = 9;
  while (paddedPrintRows.length < maxPrintRowsCount) {
    paddedPrintRows.push({
      id: `empty-${paddedPrintRows.length}`,
      classificationCode: '',
      mediaNumber: '',
      title: '',
      startDate: '',
      endDate: '',
      jenisArsip: '',
      destructionYear: ''
    });
  }

  // Cari tahun musnah tertinggi untuk kotak yang diprint
  const printBoxDestructionYear = itemsToPrint.length > 0
    ? Math.max(...itemsToPrint.map(i => i.destructionYear))
    : 2025;

  const firstPrintItem = itemsToPrint[0];

  // --- COMPONENT: LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-300 relative">
        {/* Toggle Mode Gelap */}
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all duration-300"
          title="Ubah Tema"
        >
          {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
        </button>

        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-500 border border-slate-100 dark:border-slate-700 transition-colors duration-300">
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

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Silakan masuk dengan akun Karyawan Panin Bank Anda.</p>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="ID Karyawan (cth: KRY-09228)"
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
              
              <div className="flex justify-between items-center text-xs px-1">
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setForgotError(''); setForgotSuccess(''); setForgotInput(''); }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Lupa Kata Sandi?
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setRegError(''); setRegSuccess(''); setRegEmployeeId(''); setRegFullName(''); setRegEmail(''); setRegPassword(''); }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Daftar ID Baru
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button disabled={isLoggingIn} className="w-full bg-indigo-900 dark:bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 disabled:opacity-50">
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : "Login"}
              </button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-2">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Registrasi ID Karyawan Baru</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Lengkapi formulir untuk mendaftarkan akun di sistem internal.</p>
              </div>
              
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="ID Karyawan (cth: KRY-09228)"
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  value={regEmployeeId}
                  onChange={e => setRegEmployeeId(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Nama Lengkap Karyawan"
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input
                  type="email"
                  placeholder="Email Perusahaan (cth: nama@panin.co.id)"
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat Kata Sandi"
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {regError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-xl flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-semibold animate-pulse">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <button disabled={isRegistering} className="w-full bg-blue-900 dark:bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-black dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none active:scale-95 disabled:opacity-50">
                {isRegistering ? <Loader2 className="animate-spin" size={20} /> : "Daftar Akun Baru"}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Sudah punya akun? Kembali ke Login
                </button>
              </div>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-2">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Pemulihan Kata Sandi</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Masukkan ID Karyawan atau Email perusahaan Anda untuk verifikasi.</p>
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="ID Karyawan / Email Perusahaan"
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  value={forgotInput}
                  onChange={e => setForgotInput(e.target.value)}
                  required
                />
              </div>

              {forgotError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-xl flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-semibold">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <button disabled={isSendingForgot} className="w-full bg-indigo-900 dark:bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 disabled:opacity-50">
                {isSendingForgot ? <Loader2 className="animate-spin" size={20} /> : "Kirim Link Pemulihan"}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            </form>
          )}

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

      {/* Sidebar Desktop */}
      <aside className="w-64 bg-indigo-950 dark:bg-slate-950 text-white p-6 hidden md:flex flex-col fixed h-full z-50 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold italic">
            <img src="logo_panin.png" alt="Panin Bank" className="max-w-full max-h-full object-contain" />
          </div>
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
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-3 w-full p-4 rounded-2xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-indigo-800 dark:bg-indigo-600 text-white shadow-lg dark:shadow-none' : 'text-indigo-300 dark:text-slate-400 hover:bg-indigo-900/50 dark:hover:bg-slate-900/50 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label.toUpperCase()}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-indigo-900 dark:border-slate-800 px-2">
          <button
            onClick={() => { setIsLoggedIn(false); setCurrentUser(null); setIsMobileMenuOpen(false); }}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-white transition"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile (Drawer Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay Background */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer Content */}
          <aside className="relative w-64 bg-indigo-950 dark:bg-slate-950 text-white p-6 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300 transition-colors duration-300">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-indigo-300 hover:text-white bg-indigo-900/50 dark:bg-slate-800 rounded-xl"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="w-8 h-8 rounded flex items-center justify-center font-bold italic">
                <img src="logo_panin.png" alt="Panin Bank" className="max-w-full max-h-full object-contain" />
              </div>
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
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-3 w-full p-4 rounded-2xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-indigo-800 dark:bg-indigo-600 text-white shadow-lg dark:shadow-none' : 'text-indigo-300 dark:text-slate-400 hover:bg-indigo-900/50 dark:hover:bg-slate-900/50 hover:text-white'}`}
                >
                  <item.icon size={18} /> {item.label.toUpperCase()}
                </button>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-indigo-900 dark:border-slate-800 px-2">
              <button
                onClick={() => { setIsLoggedIn(false); setCurrentUser(null); setIsMobileMenuOpen(false); }}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-white transition"
              >
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 w-full">

        <header className={`flex justify-between items-center sticky top-2 sm:top-4 z-40 transition-all duration-300 py-3 sm:py-4 px-4 sm:px-6 mb-6 sm:mb-8 ${
          isHeaderScrolled
            ? 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-md rounded-2xl border border-slate-200 dark:border-slate-700'
            : 'bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700'
        }`}>
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-inner md:hidden hover:scale-105 active:scale-95 transition-all duration-300 ${isHeaderScrolled ? 'p-2' : 'p-3'}`}
            >
              <Menu size={isHeaderScrolled ? 14 : 18} className="transition-all duration-300" />
            </button>
            <div>
              <h1 className={`font-black text-indigo-950 dark:text-white uppercase tracking-tight transition-all duration-300 ${
                isHeaderScrolled ? 'text-[10px] sm:text-[13px] md:text-base' : 'text-xs sm:text-base md:text-xl'
              }`}>
                {activeTab === 'dashboard' && "Kinerja Layanan Terintegrasi AI"}
                {activeTab === 'ecm' && "Enterprise Content Management"}
                {activeTab === 'archive' && "Pusat Kearsipan"}
                {activeTab === 'crm' && "Service Interaction"}
              </h1>
              <p className={`text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-all duration-300 ${
                isHeaderScrolled ? 'text-[6px] sm:text-[8px] mt-0.5' : 'text-[8px] sm:text-[10px] mt-1'
              }`}>
                User: {currentUser?.fullName || 'Maulana Yusup Wijaya'} • ID: {currentUser?.employeeId || employeeId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Toggle Mode Gelap */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-inner hover:scale-105 active:scale-95 transition-all duration-300 ${isHeaderScrolled ? 'p-2' : 'p-3'}`}
              title="Ubah Tema"
            >
              {darkMode ? (
                <Sun size={isHeaderScrolled ? 14 : 18} className="text-amber-500 transition-all duration-300" />
              ) : (
                <Moon size={isHeaderScrolled ? 14 : 18} className="text-indigo-600 transition-all duration-300" />
              )}
            </button>
            <div className={`bg-indigo-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black shadow-inner transition-all duration-300 ${
              isHeaderScrolled ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
              <User size={isHeaderScrolled ? 16 : 20} className="transition-all duration-300" />
            </div>
          </div>
        </header>

        {/* Tab Content: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Ringkas Dashboard */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Dashboard Administrasi Kearsipan
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                  Otomatisasi Pelabelan & Pemantauan Retensi Arsip Fisik Bank
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700">
                <Sparkles size={12} /> AI Assisted System
              </span>
            </div>

            {/* Statistik Utama Dinamis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Total Berkas Terdaftar', 
                  val: physicalArchives.length, 
                  icon: FileText, 
                  color: 'indigo', 
                  desc: 'Jumlah berkas arsip fisik' 
                },
                { 
                  label: 'Kotak (Box) Terlabeli', 
                  val: getBoxesSummary().length, 
                  icon: Database, 
                  color: 'orange', 
                  desc: 'Kotak dus arsip terdaftar' 
                },
                { 
                  label: 'Otomatisasi JRA', 
                  val: '100%', 
                  icon: Sparkles, 
                  color: 'green', 
                  desc: 'Retensi terisi otomatis' 
                },
                { 
                  label: 'Akurasi Klasifikasi AI', 
                  val: '96.8%', 
                  icon: CheckCircle2, 
                  color: 'blue', 
                  desc: 'Tingkat keandalan Gemini AI' 
                },
              ].map(card => {
                const colorClasses = {
                  indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
                  orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
                  green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
                  blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                };
                return (
                  <div key={card.label} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center transition-all duration-300">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${colorClasses[card.color] || ''}`}>
                      <card.icon size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">{card.val}</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{card.label}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 italic">"{card.desc}"</p>
                  </div>
                );
              })}
            </div>

            {/* AI Classification Widget & Progress Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Asisten Pelabelan AI */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300">
                <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6 flex items-center gap-2">
                  <Sparkles size={18} className="text-orange-500 animate-pulse" /> Asisten Cerdas Pelabelan AI (Gemini)
                </h3>
                
                <form onSubmit={handleClassifyDocument} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Masukkan nama dokumen/folder (cth: 'Laporan Kliring Bulanan RTGS')"
                      className="flex-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      value={aiLabelInput}
                      onChange={e => setAiLabelInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isClassifying || !aiLabelInput.trim()}
                      className="bg-indigo-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
                    >
                      {isClassifying ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      {isClassifying ? 'Menganalisis...' : 'Dapatkan Label'}
                    </button>
                  </div>
                </form>

                {aiLabelResult && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-indigo-50/50 dark:from-slate-900/40 dark:to-slate-900/20 border border-indigo-100/50 dark:border-slate-700 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                        Hasil Analisis AI
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleUseClassification(aiLabelResult)}
                        className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        <Plus size={12} /> Gunakan di Form Input
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Kode Klasifikasi</span>
                        <span className="text-sm font-black text-indigo-950 dark:text-white block mt-1">{aiLabelResult.classificationCode}</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm col-span-1 sm:col-span-2">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Masalah / Judul Resmi</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200 block mt-1 truncate">{aiLabelResult.title}</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Retensi Arsip (JRA)</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-1">{aiLabelResult.jra} Tahun</span>
                      </div>
                      <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tahun Kemusnahan</span>
                        <span className="text-sm font-black text-red-500 dark:text-red-400 block mt-1">{new Date().getFullYear() + aiLabelResult.jra}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Digitalisasi */}
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all duration-300">
                <div>
                  <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6 flex items-center gap-2">
                    <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" /> Target Kerja Praktek
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-[9px] font-bold mb-1.5 uppercase text-slate-600 dark:text-slate-400">
                        <span>Digitalisasi Arsip Fisik</span>
                        <span className="text-emerald-600 dark:text-emerald-400">85% Terealisasi</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 dark:bg-emerald-400 w-[85%] transition-all duration-1000"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] font-bold mb-1.5 uppercase text-slate-600 dark:text-slate-400">
                        <span>Otomatisasi Pelabelan Dus (DIK)</span>
                        <span className="text-indigo-600 dark:text-indigo-400">100% Selesai</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="bg-indigo-600 dark:bg-indigo-500 w-full transition-all duration-1000"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-50 dark:border-slate-700/50 text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed italic">
                  Sistem otomatisasi ini memangkas pencarian dan penyusunan Daftar Isi Kotak (DIK) dari 30 menit per box menjadi di bawah 1 menit secara real-time.
                </div>
              </div>
            </div>

            {/* Daftar Kotak Terlabeli Terbaru */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
              <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-2">
                  <Database size={16} className="text-indigo-600" /> Daftar Kotak (Box) Arsip Terlabeli
                </h3>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full border border-slate-100 dark:border-slate-600">
                  {getBoxesSummary().length} Box Siap Cetak
                </span>
              </div>

              {getBoxesSummary().length === 0 ? (
                <div className="text-center py-12 text-slate-300 dark:text-slate-500">
                  <Info size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">Belum ada box yang terdaftar di database</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-700/50">
                        <th className="py-4 px-6">No. Box</th>
                        <th className="py-4 px-6">Unit / Cabang</th>
                        <th className="py-4 px-6 text-center">Jumlah Berkas</th>
                        <th className="py-4 px-6">Klasifikasi Terkait</th>
                        <th className="py-4 px-6 text-center">JRA / Tahun Musnah</th>
                        <th className="py-4 px-6 text-right">Opsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {getBoxesSummary().slice(0, 5).map(box => {
                        const branch = BANDUNG_BRANCHES.find(b => b.code === box.kategoriUnit);
                        const branchName = branch ? branch.name : box.kategoriUnit;
                        const classificationsArray = Array.from(box.classifications);
                        
                        return (
                          <tr key={box.boxNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-black">
                                {box.boxNumber}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-slate-900 dark:text-white font-extrabold">{branchName}</p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{box.kategoriUnit}</p>
                            </td>
                            <td className="py-4 px-6 text-center text-slate-900 dark:text-white font-extrabold">
                              {box.items.length} Berkas
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {classificationsArray.map(c => (
                                  <span key={c} className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-lg">
                                Musnah: {box.destructionYear}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => handleDirectPrintBox(box.boxNumber)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-md dark:shadow-none active:scale-95"
                              >
                                <Printer size={12} /> Cetak Label DIK
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Smart ECM */}
        {activeTab === 'ecm' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all duration-300">
                <div className="flex items-center gap-2 flex-1">
                  <Search size={20} className="text-slate-300 dark:text-slate-500 ml-2" />
                  <input
                    type="text"
                    placeholder="contoh: 'Cari kebijakan bunga KPR terbaru'"
                    className="w-full bg-transparent py-3 text-sm outline-none font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    value={ecmSearch}
                    onChange={e => setEcmSearch(e.target.value)}
                  />
                </div>
                <button className="bg-indigo-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black tracking-widest hover:bg-black dark:hover:bg-indigo-700 transition shadow-lg dark:shadow-none text-center">
                  SEARCH
                </button>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center">
                  <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest">Repository Digital</h3>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3 py-1.5 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-slate-600 transition flex items-center gap-1 font-bold text-[10px] uppercase">
                      <Plus size={12} /> Upload Berkas
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleEcmUpload}
                      />
                    </label>
                    <Filter size={16} className="text-slate-300 dark:text-slate-500 cursor-pointer" />
                  </div>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {filteredEcmDocuments.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => handleEcmSummarize(doc)}
                      className={`p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition group ${selectedDoc?.id === doc.id ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1 mr-2">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:bg-white dark:group-hover:bg-slate-600 border border-transparent group-hover:border-indigo-100 dark:group-hover:border-slate-700 transition shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate sm:whitespace-normal">{doc.title}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 tracking-tighter truncate">{doc.type} • {doc.size} • {doc.date}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className={`transition shrink-0 ${selectedDoc?.id === doc.id ? 'text-indigo-600 dark:text-indigo-400 translate-x-1' : 'text-slate-200 dark:text-slate-700'}`} />
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
              <div className="p-6 sm:p-8 flex-1">
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

        {/* Tab Content: Arsip (Modul Kearsipan Terintegrasi) */}
        {activeTab === 'archive' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Sub-Tab Navigation Header */}
            <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 pb-4">
              <button
                onClick={() => setArchiveSubTab('nasabah')}
                className={`pb-2 text-xs font-black uppercase tracking-widest transition-all ${archiveSubTab === 'nasabah' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Pencarian Dokumen Nasabah
              </button>
              <button
                onClick={() => setArchiveSubTab('fisik')}
                className={`pb-2 text-xs font-black uppercase tracking-widest transition-all ${archiveSubTab === 'fisik' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Dus Fisik & Label DIK
              </button>
            </div>

            {/* Sub-Tab 1: Pencarian Dokumen Nasabah */}
            {archiveSubTab === 'nasabah' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-indigo-900 dark:bg-slate-800 text-white p-6 sm:p-10 rounded-3xl shadow-xl dark:shadow-none border border-transparent dark:border-slate-700 relative overflow-hidden transition-all duration-300">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10"><Database size={200} /></div>
                  <div className="relative z-10">
                    <h2 className="text-xl sm:text-2xl font-black mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 uppercase tracking-tight">
                      <span className="flex items-center gap-3"><Sparkles size={28} className="text-white-400" /> Cari Arsip Nasabah</span>
                      <button 
                        onClick={() => setIsAddDocOpen(true)}
                        className="flex items-center justify-center gap-2 text-xs font-black bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl border border-white/10 transition active:scale-95 uppercase tracking-wider shrink-0"
                      >
                        <Plus size={16} /> Tambah Dokumen
                      </button>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                      <input
                        type="text"
                        placeholder="Masukkan Nama Nasabah atau Nomor CIF"
                        className="flex-1 bg-transparent px-4 py-2 text-white placeholder:text-indigo-200 dark:placeholder:text-slate-400 outline-none text-base sm:text-lg font-medium"
                        value={archiveSearch}
                        onChange={e => setArchiveSearch(e.target.value)}
                      />
                      <button
                        onClick={handleArchiveSearch}
                        disabled={isArchiveSearching}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-xl font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20"
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
                  <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-md dark:shadow-none border-l-8 border-l-orange-500 dark:border-slate-700 animate-in slide-in-from-left-4 duration-500 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start transition-colors duration-300">
                    <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-red-600 dark:text-orange-400 rounded-2xl shadow-sm shrink-0"><Sparkles size={24} /></div>
                    <div>
                      <h3 className="text-red-600 dark:text-orange-500 font-black text-xs uppercase tracking-widest mb-2">Generative AI Insight</h3>
                      <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">"{archiveInsight}"</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: List of found documents */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[350px] transition-all duration-300">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-700/50 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center bg-slate-50/50 dark:bg-slate-900/20">
                      <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest">Hasil Pemindaian</h3>
                      <span className="text-[10px] font-black bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase">Total: {foundArchives.length}</span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {foundArchives.length > 0 ? foundArchives.map(f => {
                        const isSelected = selectedScanDoc && selectedScanDoc.id === f.id;
                        let statusIcon = null;
                        if (f.id === 101 || f.id === 104) {
                          statusIcon = <AlertTriangle className="text-amber-500 shrink-0" size={13} />;
                        } else {
                          statusIcon = <Check className="text-green-500 shrink-0" size={13} />;
                        }

                        return (
                          <div
                            key={f.id}
                            onClick={() => handleEcmDocScan(f)}
                            className={`p-5 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition cursor-pointer relative ${
                              isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-l-orange-500 dark:border-l-indigo-500' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1 mr-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition ${
                                isSelected
                                  ? 'bg-orange-50 border-orange-200 dark:bg-indigo-900/30 dark:border-indigo-800 text-orange-600 dark:text-indigo-400 shadow-sm'
                                  : 'bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-300 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-900'
                              }`}>
                                <FileText size={20} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">{f.doc}</p>
                                  {statusIcon}
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 truncate">
                                  Nasabah: <span className="text-slate-600 dark:text-slate-300">{f.name}</span>
                                </p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">
                                  CIF: {f.cif} • Kat: {f.cat}
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={16} className={`shrink-0 transition-transform ${
                              isSelected ? 'translate-x-1 text-orange-500 dark:text-indigo-400' : 'text-slate-100 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`} />
                          </div>
                        );
                      }) : (
                        <div className="py-24 text-center">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                            <Database size={24} className="text-slate-200 dark:text-slate-600" />
                          </div>
                          <p className="text-slate-300 dark:text-slate-500 font-black text-[10px] uppercase tracking-wider px-4">Masukkan kata kunci pencarian</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: AI Scan Detail Panel */}
                  <div className="lg:col-span-7">
                    {isScanningDoc ? (
                      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center min-h-[350px] text-center relative overflow-hidden transition-all duration-300">
                        {/* Scanning Glowing Line animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 dark:via-indigo-400 to-transparent animate-pulse"></div>
                        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4" size={36} />
                        <h4 className="text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-[0.2em] animate-pulse">AI Scan Engine Aktif</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">Mengecek OCR, validitas NIK, & keaslian stempel...</p>
                      </div>
                    ) : selectedScanDoc && scanResult ? (
                      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300 space-y-6">
                        {/* Detail Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                          <div>
                            <span className="text-[9px] font-black bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">
                              Laporan Scan AI
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-2 leading-tight">
                              {selectedScanDoc.doc}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                              CIF: {selectedScanDoc.cif} • Nasabah: {selectedScanDoc.name}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${scanResult.riskColor}`}>
                              {scanResult.risk}
                            </span>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                              scanResult.status === 'Valid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                : scanResult.status === 'Flagged'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {scanResult.status}
                            </span>
                          </div>
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                            Poin Pemeriksaan AI
                          </h4>
                          <div className="space-y-2">
                            {scanResult.checklist.map((item, idx) => (
                              <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/50 dark:border-slate-700/20 hover:border-slate-200 dark:hover:border-slate-700 transition">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  {item.status === 'PASS' ? (
                                    <div className="mt-0.5 p-0.5 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full shrink-0">
                                      <Check size={10} />
                                    </div>
                                  ) : (
                                    <div className="mt-0.5 p-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full shrink-0">
                                      <AlertTriangle size={10} />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 leading-tight">
                                      {item.label}
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                                      {item.details}
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${item.status === 'PASS' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                  {item.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Recommendation Box */}
                        <div className="bg-orange-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-orange-100/50 dark:border-slate-700/50">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Sparkles size={14} className="text-orange-500 animate-pulse" />
                            <h4 className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">
                              Analisis & Rekomendasi AI
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                            "{scanResult.recommendation}"
                          </p>
                        </div>

                        {/* Interactive action controls */}
                        <div className="flex flex-wrap gap-2.5 pt-2">
                          <button
                            onClick={() => {
                              setToastMessage(`Dokumen ${selectedScanDoc.doc} disetujui secara manual.`);
                              const updatedChecklist = scanResult.checklist.map(c => ({
                                ...c,
                                status: 'PASS',
                                details: c.status === 'WARNING' ? 'Disetujui manual oleh petugas' : c.details
                              }));
                              setScanResult({
                                ...scanResult,
                                status: 'Valid',
                                risk: 'Low Risk',
                                riskColor: 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900',
                                checklist: updatedChecklist
                              });
                            }}
                            className="flex-1 min-w-[120px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/10 active:scale-98"
                          >
                            <Check size={14} /> Setujui
                          </button>
                          <button
                            onClick={() => {
                              setToastMessage(`Dokumen ${selectedScanDoc.doc} ditandai untuk eskalasi review.`);
                              setScanResult({
                                ...scanResult,
                                status: 'Flagged',
                                risk: 'High Risk',
                                riskColor: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900'
                              });
                            }}
                            className="flex-1 min-w-[120px] py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-md shadow-amber-950/10 active:scale-98"
                          >
                            <ShieldAlert size={14} /> Eskalasi Review
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedScanDoc.cif);
                              setToastMessage(`Nomor CIF ${selectedScanDoc.cif} berhasil disalin!`);
                            }}
                            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition flex items-center justify-center shadow-sm active:scale-95"
                            title="Salin Nomor CIF"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setToastMessage(`Mengunduh berkas ${selectedScanDoc.doc}...`);
                            }}
                            className="p-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-900 dark:hover:bg-slate-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl transition flex items-center justify-center border border-indigo-100 dark:border-slate-700 shadow-sm active:scale-95"
                            title="Unduh Berkas"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center min-h-[350px] text-center transition-all duration-300">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-slate-700">
                          <Database size={24} className="animate-pulse" />
                        </div>
                        <h4 className="text-slate-800 dark:text-slate-300 font-black text-xs uppercase tracking-[0.2em]">Menunggu Seleksi Dokumen</h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium max-w-xs mx-auto">
                          Klik salah satu dokumen hasil pencarian di panel kiri untuk menjalankan AI Scan Engine dan memverifikasi data berkas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Kearsipan Dus Fisik & Cetak Label DIK */}
            {archiveSubTab === 'fisik' && (
              <div className="space-y-6 animate-in fade-in duration-300">

                {/* Ringkasan Kearsipan Fisik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Box / Dus</h4>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{getBoxesSummary().length} Box</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Database size={20} /></div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Dokumen Arsip</h4>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{physicalArchives.length} Item</h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-slate-900 text-green-600 dark:text-green-400 rounded-2xl"><FileText size={20} /></div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Arsip Aktif (Belum Musnah)</h4>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                        {physicalArchives.filter(a => a.destructionYear >= 2026).length} Item
                      </h3>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-slate-900 text-amber-600 dark:text-amber-400 rounded-2xl"><CheckCircle2 size={20} /></div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Kode Cabang Utama</h4>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white mt-2">BAN/BSE (Bandung)</h3>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-slate-900 text-red-600 dark:text-red-400 rounded-2xl"><User size={20} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                  {/* Left Column: Form Input Arsip Fisik Baru */}
                  <div className="xl:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-700">
                      {editingItem ? <Edit2 className="text-amber-500" size={18} /> : <Plus className="text-indigo-600" size={18} />}
                      <h3 className="font-black text-xs uppercase text-slate-800 dark:text-white tracking-widest">
                        {editingItem ? `Edit Data Arsip #${editingItem.id}` : 'Input Kearsipan Baru'}
                      </h3>
                    </div>

                    <form onSubmit={handleAddPhysicalArchive} className="space-y-4">
                      <div>
                        {classMode === 'select' ? (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Kode Klasifikasi *</label>
                              <button
                                type="button"
                                onClick={() => { setClassMode('manual'); setSelectedPreset(''); setNewClassification(''); setNewTitle(''); }}
                                className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:underline"
                              >
                                Ketik Manual
                              </button>
                            </div>
                             <div className="relative">
                              {/* Click catcher overlay to dismiss dropdown when user clicks outside */}
                              {isClassDropdownOpen && (
                                <div 
                                  className="fixed inset-0 z-40 bg-transparent" 
                                  onClick={() => setIsClassDropdownOpen(false)}
                                />
                              )}
                              
                              <div className="relative z-50">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
                                <input
                                  type="text"
                                  placeholder="Cari kode/judul klasifikasi..."
                                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 pl-10 pr-10 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                                  value={classSearchQuery}
                                  onChange={e => {
                                    setClassSearchQuery(e.target.value);
                                    setIsClassDropdownOpen(true);
                                  }}
                                  onFocus={() => setIsClassDropdownOpen(true)}
                                />
                                {classSearchQuery && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setClassSearchQuery('');
                                      setSelectedPreset('');
                                      setNewClassification('');
                                      setNewTitle('');
                                      setIsClassDropdownOpen(true);
                                    }}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>

                              {isClassDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-50 dark:divide-slate-700/50">
                                  {filteredPresets.length > 0 ? (
                                    filteredPresets.map(c => (
                                      <div
                                        key={c.code}
                                        className="p-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors duration-150 text-left"
                                        onClick={() => {
                                          setSelectedPreset(c.code);
                                          setNewClassification(c.codeActual || c.code);
                                          setNewTitle(c.title);
                                          setNewJra(String(c.defaultJra));
                                          setClassSearchQuery(`${c.code} - ${c.title}`);
                                          setIsClassDropdownOpen(false);
                                        }}
                                      >
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono mr-1.5">{c.code}</span> - {c.title}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-3 text-xs text-slate-400 dark:text-slate-500 italic text-center">Tidak ditemukan klasifikasi yang cocok</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Kode Klasifikasi *</label>
                              <button
                                type="button"
                                onClick={() => { setClassMode('select'); setNewClassification(''); setNewTitle(''); }}
                                className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:underline"
                              >
                                Pilih dari List
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Contoh: AK 99.01"
                              required
                              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                              value={newClassification}
                              onChange={e => setNewClassification(e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Masalah / Judul Arsip *</label>
                        <input
                          type="text"
                          placeholder="Contoh: Laporan Neraca"
                          required
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Tanggal Awal</label>
                          <input
                            type="date"
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                            value={newStartDate}
                            onChange={e => setNewStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Tanggal Akhir *</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                            value={newEndDate}
                            onChange={e => setNewEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">JRA (Retensi - Tahun)</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                            value={newJra}
                            onChange={e => setNewJra(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Tahun Musnah</label>
                          <input
                            type="text"
                            readOnly
                            disabled
                            placeholder="Auto-calculated"
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none cursor-not-allowed"
                            value={newDestructionYear ? `${newDestructionYear} (Akhir + JRA)` : ''}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">No. Media Simpan *</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Contoh: 1"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                            value={newMediaNumber}
                            onChange={e => setNewMediaNumber(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">No. Kotak Arsip *</label>
                          <input
                            type="text"
                            placeholder="Contoh: 1"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                            value={newBoxNumber}
                            onChange={e => setNewBoxNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Kode Cabang *</label>
                        <select
                          required
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl py-3 px-3 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                          value={newUnitCategory}
                          onChange={e => setNewUnitCategory(e.target.value)}
                        >
                          {BANDUNG_BRANCHES.map(branch => (
                            <option key={branch.code} value={branch.code}>
                              {branch.name} ({branch.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {editingItem ? (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-2xl transition-all active:scale-95 text-center text-xs uppercase tracking-wider"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md text-xs uppercase tracking-wider"
                          >
                            Update Data
                          </button>
                        </div>
                      ) : (
                        <button type="submit" className="w-full mt-2 bg-indigo-900 dark:bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md">
                          <Plus size={16} /> Simpan Data Arsip
                        </button>
                      )}
                    </form>
                  </div>

                  {/* Right Column: Box Grid & Table Database */}
                  <div className="xl:col-span-2 space-y-6">

                    {/* Daftar Box / Dus Fisik */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest">Grup Dus Fisik</h3>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">Pilih Box Untuk Filter Tabel</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getBoxesSummary().map(box => (
                          <div
                            key={box.boxNumber}
                            className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden group ${filterBoxNumber === box.boxNumber ? 'border-2 border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-100 dark:border-slate-700'}`}
                          >
                            {filterBoxNumber === box.boxNumber && (
                              <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-600 text-white flex items-center justify-center rounded-bl-2xl">
                                <CheckCircle2 size={14} />
                              </div>
                            )}
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                                  <Database size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                  Box {String(box.boxNumber).padStart(2, '0')}
                                </span>
                              </div>

                              <h4 className="font-black text-slate-800 dark:text-white text-base">Kotak Dus {box.boxNumber}</h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 tracking-tight">
                                {box.items.length} Dokumen • JRA Max: {box.destructionYear}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-1">
                                {Array.from(box.classifications).slice(0, 3).map(code => (
                                  <span key={code} className="text-[8px] font-extrabold px-2 py-0.5 bg-slate-50 dark:bg-slate-900/50 text-indigo-600 dark:text-slate-400 rounded-md border border-slate-100 dark:border-slate-700">
                                    {code}
                                  </span>
                                ))}
                                {box.classifications.size > 3 && (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md">
                                    +{box.classifications.size - 3}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (filterBoxNumber === box.boxNumber) {
                                    setFilterBoxNumber('');
                                  } else {
                                    setFilterBoxNumber(box.boxNumber);
                                  }
                                }}
                                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition ${filterBoxNumber === box.boxNumber ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}
                              >
                                {filterBoxNumber === box.boxNumber ? "Aktif" : "Filter"}
                              </button>

                              <button
                                type="button"
                                onClick={() => setPrintBoxNumber(box.boxNumber)}
                                className="py-2 bg-indigo-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 shadow-md active:scale-95"
                              >
                                <Printer size={10} /> Label DIK
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tabel Database Kearsipan */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300">

                      {/* Filter & Search Bar */}
                      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                        <div>
                          <h3 className="font-black text-xs uppercase text-slate-800 dark:text-white tracking-wide">Database Kearsipan Fisik</h3>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">
                            {filterBoxNumber ? `Menampilkan Box ${filterBoxNumber}` : 'Menampilkan Seluruh Dokumen'} ({filteredPhysicalArchives.length} item)
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          {/* Tombol Import Excel */}
                          <button
                            type="button"
                            onClick={() => document.getElementById('excel-import-input').click()}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-white dark:text-emerald-400 border border-transparent dark:border-emerald-500/30 text-[9px] font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                            title="Unggah file Excel (.xlsx / .xls)"
                          >
                            <Upload size={12} />
                            Import Excel
                          </button>
                          <input
                            id="excel-import-input"
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleExcelImport}
                          />

                          {/* Tombol Export Excel */}
                          <button
                            type="button"
                            onClick={handleExcelExport}
                            className="px-3.5 py-2 bg-indigo-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                            title="Unduh database ke Excel"
                          >
                            <Download size={12} />
                            Export Excel
                          </button>

                          {/* Tombol Reset Database */}
                          <button
                            type="button"
                            onClick={handleResetDatabase}
                            className="px-3.5 py-2 bg-slate-500 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-650 text-white text-[9px] font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                            title="Reset database ke data awal"
                          >
                            <RotateCcw size={12} />
                            Reset Data
                          </button>

                          {filterBoxNumber && (
                            <button
                              onClick={() => setFilterBoxNumber('')}
                              className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded-xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-center gap-1"
                            >
                              Reset Filter Box <X size={10} />
                            </button>
                          )}

                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                            <span>Urutan:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                              {sortField === 'destructionYear' && 'Tahun Musnah'}
                              {sortField === 'classificationCode' && 'Kode Klasifikasi'}
                              {sortField === 'title' && 'Judul Arsip'}
                              {sortField === 'startDate' && 'Tahun Awal'}
                              {sortField === 'endDate' && 'Tahun Akhir'}
                              {sortField === 'jra' && 'JRA'}
                              {sortField === 'mediaNumber' && 'No. Media'}
                              {sortField === 'boxNumber' && 'No. Kotak'}
                              {!sortField && 'Bawaan'}
                            </span>
                            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-black">
                              {sortOrder === 'asc' ? 'ASC' : 'DESC'}
                            </span>
                          </div>

                          <div className="relative flex items-center bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl px-3 py-1.5 shrink-0">
                            <Search size={14} className="text-slate-400" />
                            <input
                              type="text"
                              placeholder="Cari judul/kode..."
                              className="bg-transparent pl-2 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full sm:w-40"
                              value={searchPhysicalQuery}
                              onChange={e => setSearchPhysicalQuery(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Table List */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/10">
                              <th className="p-4 text-center w-28">No / Aksi</th>
                              <th 
                                className="p-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('classificationCode')}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>Kode Klasifikasi</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'classificationCode' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                              <th 
                                className="p-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('title')}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>Masalah / Judul Arsip</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                              <th 
                                className="p-4 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('startDate')}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>Tahun Awal</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'startDate' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                              <th 
                                className="p-4 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('endDate')}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>Tahun Akhir</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'endDate' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                              <th 
                                className="p-4 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('jra')}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>JRA</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'jra' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                              <th 
                                className="p-4 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('destructionYear')}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>Tahun Musnah</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'destructionYear' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                              <th 
                                className="p-4 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('mediaNumber')}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>No. Media</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'mediaNumber' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                              <th 
                                className="p-4 text-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-850 select-none transition-colors"
                                onClick={() => handleSort('boxNumber')}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  <span>No. Kotak</span>
                                  <span className="text-[10px] text-indigo-500 font-bold">
                                    {sortField === 'boxNumber' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                                  </span>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {filteredPhysicalArchives.length > 0 ? (
                              filteredPhysicalArchives.map((item, index) => (
                                <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 text-slate-700 dark:text-slate-300 font-semibold transition ${editingItem && editingItem.id === item.id ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                                  <td className="p-4 text-center font-bold text-slate-400 dark:text-slate-500">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                      <span className="text-[11px] font-black">{index + 1}</span>
                                      <div className="flex gap-1 shrink-0">
                                        <button
                                          onClick={() => handleStartEdit(item)}
                                          className={`p-1.5 rounded-lg border transition ${editingItem && editingItem.id === item.id ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-200 text-slate-500 hover:text-amber-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-amber-500'}`}
                                          title="Edit Data"
                                        >
                                          <Edit2 size={11} />
                                        </button>
                                        <button
                                          onClick={() => handleDeletePhysicalArchive(item.id)}
                                          className="p-1.5 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-red-500 rounded-lg transition"
                                          title="Hapus Data"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-indigo-900 dark:text-indigo-400">{item.classificationCode}</td>
                                  <td className="p-4">
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.title}</div>
                                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">Cabang: {item.kategoriUnit}</div>
                                  </td>
                                  <td className="p-4 text-center">{formatDateExcel(item.startDate)}</td>
                                  <td className="p-4 text-center">{formatDateExcel(item.endDate)}</td>
                                  <td className="p-4 text-center"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md font-bold">{item.jra} Thn</span></td>
                                  <td className="p-4 text-center font-bold text-red-500 dark:text-red-400">{item.destructionYear}</td>
                                  <td className="p-4 text-center font-mono font-bold">{item.mediaNumber}</td>
                                  <td className="p-4 text-center"><span className="px-2 py-1 bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold">Box {item.boxNumber}</span></td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="9" className="p-12 text-center text-slate-300 dark:text-slate-500">
                                  <Database size={40} className="mx-auto mb-3 opacity-15" />
                                  <p className="text-xs font-bold uppercase tracking-widest">Tidak ada data arsip fisik ditemukan</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Layanan Nasabah */}
        {activeTab === 'crm' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[calc(100vh-250px)] animate-in fade-in duration-500">
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden transition-all duration-300 max-h-[200px] lg:max-h-none">
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

            <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden relative transition-all duration-300 h-[600px] lg:h-full">
              {/* Chat Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/30 dark:bg-slate-900/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black text-lg shadow-inner">AS</div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase tracking-tight">Andi Setiawan</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <button onClick={handleCrmAssist} disabled={isCrmGenerating} className="w-full sm:w-auto bg-indigo-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg dark:shadow-none">
                    {isCrmGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-orange-400" />} GEN-AI ASSIST
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6 bg-slate-50/30 dark:bg-slate-900/20 scroll-smooth">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                    <div className={`max-w-[90%] sm:max-w-[80%] p-4 sm:p-5 rounded-3xl text-sm leading-relaxed border transition-all duration-300 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-900 dark:bg-indigo-600 text-white rounded-tr-none border-transparent'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none border-slate-100 dark:border-slate-600 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {crmResponse && (
                  <div className="flex justify-end animate-in slide-in-from-right-4 duration-500">
                    <div className="max-w-[95%] sm:max-w-[85%] bg-indigo-950 dark:bg-slate-900 text-white p-5 sm:p-6 rounded-3xl rounded-tr-none shadow-2xl dark:shadow-none border border-transparent dark:border-slate-700 border-l-4 border-l-orange-500 dark:border-l-orange-500 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3 border-b border-white/10 dark:border-slate-700/50 pb-2">
                        <Sparkles size={14} className="text-orange-400" />
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em]">Gen-AI Draft</p>
                      </div>
                      <p className="text-sm leading-relaxed italic text-indigo-50 dark:text-slate-300 font-medium">"{crmResponse}"</p>
                      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button onClick={handleCrmRefine} className="text-[9px] font-black px-4 py-2 bg-white/10 dark:bg-slate-800 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700 uppercase tracking-widest transition text-center">Sempurnakan</button>
                        <button onClick={handleCrmSendReply} className="text-[9px] font-black px-4 py-2 bg-orange-500 rounded-xl hover:bg-orange-600 uppercase tracking-widest transition shadow-lg text-center">Kirim Balasan</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 sm:p-6 border-t bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-2xl transition-all duration-300">
                <div className="relative">
                  <textarea
                    placeholder="Tulis pesan manual atau gunakan AI Assist..."
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 pr-20 text-sm resize-none focus:ring-2 focus:ring-indigo-900 dark:focus:ring-indigo-400 transition-all outline-none h-24 shadow-inner dark:shadow-none font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    value={userChatInput}
                    onChange={e => setUserChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  ></textarea>
                  <div className="absolute right-4 bottom-4 flex gap-2">
                    <button className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition"><Paperclip size={20} /></button>
                    <button onClick={() => handleSendMessage()} className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-black dark:hover:bg-indigo-700 shadow-xl dark:shadow-none transition active:scale-90"><Send size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL PRATINJAU & PRINT LABEL --- */}
      {printBoxNumber && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto print-modal-container">
          <div className="bg-slate-800 dark:bg-slate-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl flex flex-col max-h-[95vh] print-modal-content">

            {/* Header Modal */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-700 no-print">
              <div className="flex items-center gap-2 text-white">
                <Printer size={20} className="text-orange-400" />
                <h3 className="font-black text-sm uppercase tracking-widest">Pratinjau Cetak Label DIK (Kotak {printBoxNumber})</h3>
              </div>
              <button
                onClick={() => setPrintBoxNumber(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Preview Frame */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-700/50 rounded-2xl border border-slate-700 flex justify-center items-start print-modal-scroll">

              {/* --- KOTAK CETAK DIK (RENDER ASLI) --- */}
              <div
                id="printable-dik"
                className="bg-white text-black p-8 font-sans border-2 border-black max-w-[210mm] w-full shadow-lg relative leading-normal text-xs"
                style={{ minHeight: '270mm' }}
              >
                {/* CSS Print Stylesheet Injection */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                  @media print {
                    /* Sembunyikan elemen utama halaman dan sidebar agar tidak memakan ruang cetak */
                    aside, main, header, .no-print {
                      display: none !important;
                    }
                    
                    /* Reset HTML & Body agar tidak membuat tinggi tambahan */
                    html, body {
                      height: auto !important;
                      min-height: 0 !important;
                      overflow: visible !important;
                      background-color: #ffffff !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    
                    /* Pastikan container utama aplikasi tidak mengganggu dan ter-collapse */
                    #root > div, body > div:first-child {
                      height: auto !important;
                      min-height: 0 !important;
                      display: block !important;
                      background: transparent !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    
                    /* Atur wrapper modal agar menjadi block biasa (bukan fixed/absolute) saat dicetak */
                    .print-modal-container {
                      position: static !important;
                      width: 100% !important;
                      height: auto !important;
                      background: transparent !important;
                      display: block !important;
                      overflow: visible !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    
                    /* Hilangkan latar belakang abu-abu & border modal */
                    .print-modal-content {
                      position: static !important;
                      background: transparent !important;
                      box-shadow: none !important;
                      border: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      max-height: none !important;
                      display: block !important;
                      overflow: visible !important;
                      width: 100% !important;
                    }
                    
                    .print-modal-scroll {
                      position: static !important;
                      background: transparent !important;
                      border: none !important;
                      padding: 0 !important;
                      overflow: visible !important;
                      display: block !important;
                      width: 100% !important;
                      margin: 0 !important;
                    }

                    /* Ukuran cetak presisi kertas A4 (210mm x 297mm) */
                    #printable-dik {
                      display: block !important;
                      position: relative !important;
                      width: 210mm !important;
                      height: 297mm !important;
                      min-height: 297mm !important;
                      max-width: 100% !important;
                      margin: 0 auto !important;
                      padding: 15mm 20mm !important;
                      border: none !important;
                      box-shadow: none !important;
                      background: white !important;
                      color: black !important;
                      box-sizing: border-box !important;
                      page-break-after: avoid !important;
                      page-break-inside: avoid !important;
                    }
                    
                    @page {
                      size: A4 portrait;
                      margin: 0;
                    }
                  }
                `}} />

                {/* Judul Form */}
                <div className="text-center mb-6">
                  <h2 className="font-extrabold text-base tracking-wide uppercase leading-tight">Daftar Isi Kotak</h2>
                  <h2 className="font-extrabold text-base tracking-wide uppercase leading-tight">(DIK)</h2>
                </div>

                {/* Tabel DIK */}
                {(() => {
                  const totalItemsCount = itemsToPrint.length;
                  const tableFontSize = totalItemsCount > 15 ? 'text-[7px]' : totalItemsCount > 12 ? 'text-[8px]' : totalItemsCount > 9 ? 'text-[9px]' : 'text-[10px]';
                  const rowHeightClass = totalItemsCount > 15 ? 'h-7' : totalItemsCount > 12 ? 'h-8' : totalItemsCount > 9 ? 'h-10' : 'h-12';
                  const rowPaddingClass = totalItemsCount > 15 ? 'p-1' : totalItemsCount > 12 ? 'p-1.5' : 'p-2';
                  const innerTitleFontSize = totalItemsCount > 15 ? 'text-[7.5px]' : totalItemsCount > 12 ? 'text-[8.5px]' : totalItemsCount > 9 ? 'text-[9px]' : 'text-[10px]';
                  const innerDateFontSize = totalItemsCount > 15 ? 'text-[6px]' : totalItemsCount > 12 ? 'text-[6.5px]' : totalItemsCount > 9 ? 'text-[7px]' : 'text-[8px]';

                  return (
                    <table className={`w-full border-collapse border border-black mt-2 leading-tight font-sans ${tableFontSize}`}>
                      <thead>
                        <tr className="border-b border-black text-center font-bold">
                          <th className={`border-r border-black ${rowPaddingClass} w-[8%] text-center uppercase`}>No Urut</th>
                          <th className={`border-r border-black ${rowPaddingClass} w-[16%] text-center uppercase`}>Kode Klasifikasi</th>
                          <th className={`border-r border-black ${rowPaddingClass} w-[14%] text-center uppercase`}>No. Media Simpan</th>
                          <th className={`border-r border-black ${rowPaddingClass} w-[44%] text-left uppercase`}>Masalah/Judul Arsip</th>
                          <th className={`border-r border-black ${rowPaddingClass} w-[10%] text-center uppercase`}>Jenis Arsip</th>
                          <th className={`${rowPaddingClass} w-[8%] text-center uppercase`}>Tahun Arsip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paddedPrintRows.map((row, index) => {
                          const isRowEmpty = !row.title;

                          return (
                            <tr key={row.id} className={`border-b border-black ${rowHeightClass}`}>
                              <td className={`border-r border-black ${rowPaddingClass} text-center font-bold`}>
                                {isRowEmpty ? '' : index + 1}
                              </td>
                              <td className={`border-r border-black ${rowPaddingClass} text-center font-mono font-bold`}>
                                {row.classificationCode || ''}
                              </td>
                              <td className={`border-r border-black ${rowPaddingClass} text-center font-mono font-bold`}>
                                {row.mediaNumber || ''}
                              </td>
                              <td className={`border-r border-black ${rowPaddingClass} text-left`}>
                                {isRowEmpty ? (
                                  <span>&nbsp;</span>
                                ) : (
                                  <div>
                                    <div className={`font-bold ${innerTitleFontSize}`}>{row.title}</div>
                                    {row.startDate && row.endDate && (
                                      <div className={`${innerDateFontSize} mt-0.5 uppercase tracking-wide`}>
                                        {formatDateIndo(row.startDate)} - {formatDateIndo(row.endDate)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className={`border-r border-black ${rowPaddingClass} text-center uppercase font-bold`}></td>
                              <td className={`${rowPaddingClass} text-center font-bold`}>
                                {row.endDate ? new Date(row.endDate).getFullYear() : ''}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Box Banner Tahun Musnah */}
                <div className="border-l border-r border-b border-black py-2.5 text-center font-extrabold uppercase text-xs tracking-wider">
                  Tahun Musnah: {printBoxDestructionYear}
                </div>

                {/* Bottom Metadata Grid */}
                <div className="grid grid-cols-3 border-l border-r border-b border-black mt-4 h-24">
                  {/* Left Cell: Branch Code */}
                  <div className="border-r border-black p-4 flex items-center justify-center text-center font-sans font-black text-lg tracking-wider text-black uppercase shrink-0">
                    {firstPrintItem?.kategoriUnit || 'BAN/BSE'}
                  </div>

                  {/* Middle Cell: Empty */}
                  <div className="border-r border-black p-4"></div>

                  {/* Right Cell: Massive Box Number */}
                  <div className="p-4 flex items-center justify-center text-5xl font-black font-sans tracking-tighter text-black">
                    {String(printBoxNumber).padStart(2, '0')}
                  </div>
                </div>

              </div>

            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end gap-3 no-print">
              <button
                onClick={() => setPrintBoxNumber(null)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg shadow-orange-950/20 active:scale-95"
              >
                <Printer size={14} /> Cetak Label Sekarang
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Tambah Dokumen Nasabah */}
      {isAddDocOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-sm font-black uppercase text-indigo-950 dark:text-white tracking-wider flex items-center gap-2">
                <Plus className="text-indigo-600 dark:text-indigo-400" size={18} /> Tambah Dokumen Nasabah
              </h3>
              <button 
                onClick={() => setIsAddDocOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleAddCustomerDoc} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nama Nasabah</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap nasabah"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 transition"
                  value={addDocName}
                  onChange={e => setAddDocName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nomor CIF</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: CIF99201"
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 transition"
                  value={addDocCif}
                  onChange={e => setAddDocCif(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Berkas Dokumen</label>
                <div className="flex flex-col gap-2">
                  {addDocFilename ? (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="text-indigo-600 dark:text-indigo-400 shrink-0" size={18} />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{addDocFilename}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{addDocSize}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddDocFilename('');
                          setAddDocSize('');
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border border-dashed border-slate-250 dark:border-slate-700 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer group transition bg-slate-50/50 dark:bg-slate-900/10">
                      <Upload className="text-slate-450 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 mb-2 transition" size={24} />
                      <p className="text-xs font-black text-slate-750 dark:text-slate-300">Pilih Berkas Dokumen</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase">PDF, PNG, JPG (Maks 10MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleCustomerFileChange}
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Kategori Dokumen</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 transition"
                  value={addDocCategory}
                  onChange={e => setAddDocCategory(e.target.value)}
                >
                  <option value="Identitas">Identitas</option>
                  <option value="Agunan">Agunan</option>
                  <option value="Administrasi">Administrasi</option>
                  <option value="Finansial">Finansial</option>
                  <option value="Lainnya">Lainnya (Kustom...)</option>
                </select>
              </div>

              {addDocCategory === 'Lainnya' && (
                <div className="animate-in slide-in-from-top-2 duration-350">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Nama Kategori Kustom</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dokumen Hukum, Pajak, Sertifikasi"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 transition"
                    value={addDocCustomCategory}
                    onChange={e => setAddDocCustomCategory(e.target.value)}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDocOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow-md shadow-indigo-950/10 active:scale-98"
                >
                  Simpan Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in slide-in-from-bottom-5">
          <div className="p-1 bg-green-500/20 text-green-400 rounded-lg">
            <Check size={16} />
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wide">{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default App;