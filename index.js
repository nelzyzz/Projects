const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/spotify', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'spotify.html'));
});

app.get('/spotifysearch', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'spotifysearch.html'));
});

app.get('/tiktokdl', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tiktokdl.html'));
});

app.get('/uploader', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Uploader.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
