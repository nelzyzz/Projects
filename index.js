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

app.get('/ss', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ss.html'));
});

app.get('/xxx', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'xxx.html'));
});

app.get('/micro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'micro.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
