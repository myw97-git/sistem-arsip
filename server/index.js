import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Start listening
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(` Server Panin Akses Backend berjalan di http://localhost:${PORT}`);
  console.log(` Pastikan file .env sudah diisi dengan GEMINI_API_KEY Anda.`);
  console.log(`========================================================`);
});
