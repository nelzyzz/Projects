const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (email TEXT, password TEXT)");
    const users = [
        { email: 'joshuaapostol909@gmail.com', password: 'kiffy' },
        { email: 'joshuaapostol0967@gmail.com', password: 'kiffy' },
        { email: 'admin@burat.com', password: 'burat' }
    ];

    const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
    users.forEach(user => {
        stmt.run(user.email, user.password);
    });
    stmt.finalize();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'joshuaapostol0948',
    resave: false,
    saveUninitialized: true,
}));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const UPLOAD_PATH = process.env.UPLOAD_PATH;

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

app.get('/ss', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ss.html'));
});

app.get('/xxx', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'xxx.html'));
});

app.get('/account', (req, res) => {
    db.all("SELECT email, password FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).send('Error fetching users');
            return;
        }
        res.json(rows);
    });
});

app.get('/admin', (req, res) => {
    if (req.session.isAuthenticated) {
        const uploaded = fs.readdirSync(path.join(__dirname, 'public'));
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Admin Panel</title>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap">
                <style>
                    :root {
                        --primary-color: #00adb5;
                        --secondary-color: #393e46;
                        --background-color: #222831;
                        --text-color: #eeeeee;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Poppins', sans-serif;
                        background: linear-gradient(135deg, var(--background-color), var(--secondary-color));
                        color: var(--text-color);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                    }
                    #particles-js {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: -1;
                    }
                    .panel-container {
                        background-color: rgba(57, 62, 70, 0.8);
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
                        width: 300px;
                        text-align: center;
                    }
                    h1 {
                        margin-bottom: 20px;
                        color: var(--primary-color);
                    }
                    input {
                        width: 100%;
                        padding: 10px;
                        margin: 10px 0;
                        border: none;
                        border-radius: 5px;
                    }
                    button {
                        padding: 10px;
                        width: 100%;
                        background-color: var(--primary-color);
                        color: var(--text-color);
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #007e85;
                    }
                    .logout-button {
                        margin-bottom: 20px;
                        background-color: #d9534f;
                        width: 100px;
                    }
                    .burat {
                        margin-top: 20px;
                        text-align: left;
                        max-height: 150px;
                        overflow-y: auto;
                    }
                </style>
            </head>
            <body>
                <div id="particles-js"></div>
                <div class="panel-container">
                    <h1>Admin Panel</h1>
                    <button class="logout-button" id="logoutButton">Logout</button>
                    <form id="uploadForm" enctype="multipart/form-data">
                        <input type="file" name="file" required>
                        <button type="submit">Upload File</button>
                    </form>
                    <div class="burat">
                        <h3>Files:</h3>
                        <ul>
                            ${uploaded.map(file => `<li>${file}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
                <script>
                    particlesJS('particles-js', {
                        particles: {
                            number: { value: 80, density: { enable: true, value_area: 800 } },
                            color: { value: "#ffffff" },
                            shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
                            opacity: { value: 0.5, random: false },
                            size: { value: 3, random: true },
                            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
                            move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false },
                        },
                        interactivity: {
                            detect_on: "canvas",
                            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
                            modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } },
                        },
                        retina_detect: true
                    });

                    document.getElementById('uploadForm').addEventListener('submit', function(event) {
                        event.preventDefault();
                        const formData = new FormData(this);
                        fetch('/upload', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.text())
                        .then(data => {
                            alert(data);
                            location.reload();
                        })
                        .catch(error => console.error('Error:', error));
                    });

                    document.getElementById('logoutButton').addEventListener('click', function() {
                        fetch('/logout', { method: 'POST' })
                        .then(() => window.location.href = '/login');
                    });
                </script>
            </body>
            </html>
        `);
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    if (req.session.isAuthenticated) {
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(query, [email, password], (err, row) => {
        if (err || !row) {
            res.status(401).send('Invalid email or password');
            return;
        }
        req.session.isAuthenticated = true;
        res.redirect('/admin');
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = path.join(__dirname, UPLOAD_PATH, req.file.originalname);
    axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/${UPLOAD_PATH}/${req.file.originalname}`, {
        message: 'Upload file',
        content: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
        branch: 'main'
    }, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        res.send('File uploaded and updated in GitHub successfully');
    })
    .catch(error => {
        console.error('Error updating GitHub:', error);
        res.status(500).send('Error uploading file to GitHub.');
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out successfully');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
