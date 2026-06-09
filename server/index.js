import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE_PATH = path.join(__dirname, 'users.json');

// Helper to read users from database
const readUsersDb = async () => {
  try {
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users database, returning empty list:', error);
    return [];
  }
};

// Helper to write users to database
const writeUsersDb = async (users) => {
  try {
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to users database:', error);
    return false;
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend can access the API on any local port (5173, 5174, etc.)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// --- ENDPOINT: REGISTER AKUN KARYAWAN ---
app.post('/api/auth/register', async (req, res) => {
  const { employeeId, fullName, email, password } = req.body;

  if (!employeeId || !fullName || !email || !password) {
    return res.status(400).json({ error: 'Semua kolom registrasi wajib diisi.' });
  }

  const empIdClean = employeeId.trim().toUpperCase();
  const emailClean = email.trim().toLowerCase();

  // Validasi format email sederhana
  if (!emailClean.includes('@') || !emailClean.includes('.')) {
    return res.status(400).json({ error: 'Format email tidak valid. Gunakan email perusahaan Anda.' });
  }

  try {
    const users = await readUsersDb();

    // Cek apakah user sudah terdaftar
    const existingUser = users.find(u => u.employeeId.toUpperCase() === empIdClean || u.email.toLowerCase() === emailClean);
    if (existingUser) {
      return res.status(400).json({ error: 'ID Karyawan atau Email sudah terdaftar di sistem kearsipan.' });
    }

    // Tambahkan user baru
    const newUser = {
      employeeId: empIdClean,
      fullName: fullName.trim(),
      email: emailClean,
      password: password // Plain text untuk kemudahan simulasi tugas KP
    };

    users.push(newUser);
    await writeUsersDb(users);

    return res.json({ 
      message: 'Registrasi karyawan berhasil! Silakan masuk ke portal.',
      user: {
        employeeId: newUser.employeeId,
        fullName: newUser.fullName,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal saat mendaftarkan akun.' });
  }
});

// --- ENDPOINT: LOGIN AKUN KARYAWAN ---
app.post('/api/auth/login', async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res.status(400).json({ error: 'ID Karyawan dan kata sandi wajib diisi.' });
  }

  const empIdClean = employeeId.trim().toUpperCase();

  try {
    const users = await readUsersDb();
    const user = users.find(u => u.employeeId.toUpperCase() === empIdClean && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'ID Karyawan atau kata sandi tidak cocok. Pastikan Anda sudah mendaftar.' });
    }

    return res.json({
      message: 'Login berhasil!',
      user: {
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal saat login.' });
  }
});

// --- ENDPOINT: LUPA PASSWORD ---
app.post('/api/auth/forgot-password', async (req, res) => {
  const { employeeIdOrEmail } = req.body;

  if (!employeeIdOrEmail) {
    return res.status(400).json({ error: 'ID Karyawan atau Email perusahaan wajib diisi.' });
  }

  const searchInput = employeeIdOrEmail.trim().toLowerCase();

  try {
    const users = await readUsersDb();
    const user = users.find(u => 
      u.employeeId.toLowerCase() === searchInput || 
      u.email.toLowerCase() === searchInput
    );

    if (!user) {
      return res.status(404).json({ error: 'ID Karyawan atau email tersebut tidak terdaftar di sistem perusahaan.' });
    }

    // Simulasi pengiriman email
    console.log(`[EMAIL SIMULATION] Sending password recovery link to ${user.email} (User: ${user.fullName})`);

    return res.json({
      message: `Tautan pemulihan kata sandi telah dikirimkan ke email terdaftar Anda (${user.email}). Silakan periksa kotak masuk/spam email perusahaan Anda.`
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal saat memproses pemulihan kata sandi.' });
  }
});

// Helper to check if API key is configured
const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'YOUR_GEMINI_API_KEY_HERE' || key.trim() === '') {
    return null;
  }
  return key;
};

// --- ENDPOINT: SMART ECM SUMMARIZE ---
app.post('/api/summarize', async (req, res) => {
  const { documentTitle, documentType } = req.body;

  if (!documentTitle) {
    return res.status(400).json({ error: 'Judul dokumen wajib dicantumkan.' });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY belum dikonfigurasi di file .env server backend.' 
    });
  }

  const prompt = `Anda adalah asisten AI kearsipan (ECM) profesional untuk Panin Bank Kantor Cabang Bandung.
Tolong buatkan analisis ringkas berupa 3 poin utama dari dokumen perbankan berikut:
Judul Dokumen: "${documentTitle}"
Jenis/Kategori Dokumen: "${documentType || 'Umum'}"

Format Output:
Berikan langsung 3 poin ringkasan operasional penting dalam Bahasa Indonesia yang formal dan profesional (pisahkan dengan poin 1, 2, 3), pastikan isinya terkesan sangat spesifik untuk perbankan Panin Bank.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Gagal memproses dokumen dengan Gemini API.', 
        details: errorData 
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gagal menghasilkan ringkasan.';
    
    return res.json({ summary: generatedText.trim() });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal pada server.', details: error.message });
  }
});

// --- ENDPOINT: CRM SERVICE CHAT DRAFT ASSIST ---
app.post('/api/crm-chat', async (req, res) => {
  const { customerName, customerCif, customerMessage } = req.body;

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY belum dikonfigurasi di file .env server backend.' 
    });
  }

  const clientMsg = customerMessage || 'Halo Panin Bank, saya butuh informasi status KPR saya.';
  const clientName = customerName || 'Nasabah';
  const clientCif = customerCif || 'CIF-UNKNOWN';

  const prompt = `Anda adalah asisten Customer Relationship Management (CRM) berbasis AI untuk Panin Bank Kantor Cabang Bandung.
Tugas Anda adalah membuat draf balasan pesan yang sangat personal, ramah, sopan, formal, dan taktis untuk membalas keluhan/pertanyaan nasabah.

Profil Nasabah:
- Nama: ${clientName}
- nomor CIF: ${clientCif}
- Pesan Nasabah: "${clientMsg}"

Aturan Balasan:
1. Sapa nasabah dengan hormat dan sebutkan namanya (misal: "Halo Bapak/Ibu ${clientName}").
2. Akui pertanyaannya/keluhannya dengan ramah.
3. Berikan solusi teoritis perbankan Panin Bank dengan sopan (misal: memproses verifikasi agunan atau data administrasi, SLA proses KPR biasanya 3 hari kerja, dll).
4. Buat balasan dalam Bahasa Indonesia yang formal dan indah. Batasi balasan maksimal 3-4 kalimat.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Gagal menghasilkan draf balasan dengan Gemini API.', 
        details: errorData 
      });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Gagal menghasilkan balasan.';

    return res.json({ response: generatedText.trim() });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal pada server.', details: error.message });
  }
});

// --- ENDPOINT: AUTOMATED ARCHIVE CLASSIFICATION & LABELING ---
app.post('/api/classify', async (req, res) => {
  const { documentTitle } = req.body;

  if (!documentTitle) {
    return res.status(400).json({ error: 'Judul dokumen wajib dicantumkan untuk klasifikasi.' });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY belum dikonfigurasi di file .env server backend.' 
    });
  }

  const prompt = `Anda adalah asisten klasifikasi arsip perbankan otomatis untuk Panin Bank Kantor Cabang Bandung.
Tugas Anda adalah memprediksi kode klasifikasi arsip, nama klasifikasi/judul resmi yang sesuai, dan JRA (Jadwal Retensi Arsip) dalam tahun (sebagai angka bulat) berdasarkan judul dokumen yang diberikan.

Berikut adalah daftar acuan klasifikasi resmi kami:
1. AK 99.01 - Laporan Neraca (JRA: 5 tahun)
2. JB 99.04 - Translog (JRA: 10 tahun)
3. JB 99.01 - Maintenance Report (JRA: 5 tahun)
4. JB 99.16 - Laporan Deposito (JRA: 5 tahun)
5. JB 99.12 - Daftar Suku Bunga Deposito (JRA: 5 tahun)
6. TR 99.01 - Bloter Valas (JRA: 5 tahun)
7. JB 99.13 - Daftar Hitam Nasabah (JRA: 5 tahun)
8. TR 11.02 - Receipt Form (JRA: 5 tahun)
9. JB 99.07 - Laporan Pengisian ATM (JRA: 5 tahun)
10. JB 99.08 - SKN (JRA: 5 tahun)
11. JB 99.08 - RTGS (JRA: 5 tahun)
12. JB 10.01 - Kliring (JRA: 5 tahun)
13. JB 12.00 - Payment Point (JRA: 5 tahun)
14. JB 20.02 - ATM (JRA: 5 tahun)
15. JB 20.02 - LOG PENGGUNAAN KUNCI ATM (JRA: 5 tahun)
16. JB 10.14 - TITIPAN PINBUK (JRA: 5 tahun)
17. JB 10.14 - TITIPAN KLIRING (JRA: 5 tahun)
18. JB 10.14 - KLIRING (JRA: 5 tahun)
19. AK 03.01 - TESKEY (JRA: 5 tahun)
20. AK 03.01 - SKN (JRA: 5 tahun)
21. AK 03.01 - BI FAST (JRA: 5 tahun)

Jika judul dokumen sangat mirip dengan salah satu daftar di atas, gunakan kode klasifikasi tersebut. Jika tidak cocok sama sekali, tentukan kode klasifikasi baru yang relevan dengan format 2 huruf + spasi + 2 angka + . + 2 angka (contoh: 'JB 99.99' atau 'AK 01.02') dan berikan perkiraan JRA yang masuk akal antara 5 sampai 10 tahun berdasarkan pentingnya dokumen bagi perbankan.

Judul Dokumen yang diinput oleh user: "${documentTitle}"

Berikan output dalam format JSON mentah tanpa format markdown (no code blocks), dengan kunci berikut:
{
  "classificationCode": "Kode klasifikasi, contoh 'JB 99.04'",
  "jra": 10,
  "title": "Nama klasifikasi atau judul resmi dokumen yang bersih dan rapi, contoh 'Translog'"
}

Pastikan output HANYA berupa objek JSON yang valid dan tidak ada teks lain sebelum atau sesudahnya agar bisa diparse langsung.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Gagal memproses klasifikasi dokumen dengan Gemini API.', 
        details: errorData 
      });
    }

    const data = await response.json();
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Pembersihan block markdown jika ada
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    const parsedJson = JSON.parse(cleanedText);
    return res.json(parsedJson);
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal pada server saat klasifikasi.', details: error.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(` Server Panin Akses Backend berjalan di http://localhost:${PORT}`);
  console.log(` Pastikan file .env sudah diisi dengan GEMINI_API_KEY Anda.`);
  console.log(`========================================================`);
});
