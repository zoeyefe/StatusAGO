const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const dns = require('dns');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'https://statusago.vercel.app',
    'http://localhost:3000',
    'https://status-m4hx5siy0-zoeyefes-projects.vercel.app',
    'https://status-8zeqd2kzu-zoeyefes-projects.vercel.app',
    'https://status-9rki7mg22-zoeyefes-projects.vercel.app',
    'https://status-dwr62zut0-zoeyefes-projects.vercel.app',
    'https://*.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const STATUS_FILE = './status-history.json';
const TARGET_URL = 'https://ago.com.tr';
const TARGET_HOST = 'ago.com.tr';

// Geçmişi oku veya başlat
function loadHistory() {
  if (fs.existsSync(STATUS_FILE)) {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
  }
  return [];
}

function saveHistory(history) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(history.slice(-1000)), 'utf-8');
}

// SSL sertifika süresi kontrolü
function getSSLDaysLeft(host) {
  return new Promise((resolve) => {
    const req = https.request({
      host,
      port: 443,
      method: 'GET',
    }, (res) => {
      const cert = res.socket.getPeerCertificate();
      if (cert && cert.valid_to) {
        const expire = new Date(cert.valid_to);
        const now = new Date();
        const diff = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
        resolve(diff);
      } else {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

// DNS çözümleme
function getDNS(host) {
  return new Promise((resolve) => {
    dns.lookup(host, (err, address, family) => {
      if (err) resolve(null);
      else resolve({ address, family });
    });
  });
}

// Ana kontrol fonksiyonu
async function checkStatus() {
  const start = Date.now();
  let status = 'down';
  let responseTime = null;
  let sslDaysLeft = null;
  let dnsInfo = null;
  try {
    const res = await fetch(TARGET_URL, { method: 'GET', timeout: 7000 });
    responseTime = Date.now() - start;
    status = res.ok ? 'up' : 'down';
  } catch {
    status = 'down';
  }

  sslDaysLeft = await getSSLDaysLeft(TARGET_HOST);
  dnsInfo = await getDNS(TARGET_HOST);


  return {
    time: new Date().toISOString(),
    status,
    responseTime,
    sslDaysLeft,
    dnsInfo,
  };
}

// Periyodik kontrol ve geçmiş kaydı
async function periodicCheck() {
  const history = loadHistory();
  const result = await checkStatus();
  history.push(result);
  saveHistory(history);
}
setInterval(periodicCheck, 5 * 60 * 1000); // 5 dakikada bir
periodicCheck(); // Başlangıçta bir kez

// API key kontrolü
const validateApiKey = (req, res, next) => {
  console.log('Headers:', req.headers); // Gelen header'ları logla
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('API key header eksik veya hatalı');
    return res.status(401).json({ error: 'API key gerekli' });
  }
  
  const apiKey = authHeader.split(' ')[1];
  console.log('Gelen API Key:', apiKey);
  console.log('Beklenen API Key:', process.env.API_KEY);
  
  if (apiKey !== process.env.API_KEY) {
    console.log('API key eşleşmiyor');
    return res.status(401).json({ error: 'Geçersiz API key' });
  }
  
  next();
};

// API endpointleri
app.get('/api/status', validateApiKey, (req, res) => {
  const history = loadHistory();
  res.json({
    current: history[history.length - 1] || null,
    history: history.slice(-288), // Son 24 saat (5 dakikada bir = 288 kayıt)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
