// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

// uploads klasörü
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + ext;
        cb(null, name);
    }
});

const upload = multer({ storage });

// Static dosyaları servis et (index.html)
app.use(express.static(__dirname));

// Dosya yükleme endpointi
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "Dosya seçilmedi." });
    }

    // Dosya başarıyla yüklendi
    res.json({
        success: true,
        message: "Dosya yüklendi.",
        fileName: req.file.filename,
        filePath: `/uploads/${req.file.filename}`
    });
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
app.get('/liste', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(400).json({ error: "Dosya listesi alınamadı." });
        }

        const fileUrls = files.map(file => ({
            name: file,
            url: `/uploads/${file}`
        }));

        res.json(fileUrls);
    });
});