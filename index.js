const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (email TEXT, password TEXT)");
    db.run("INSERT INTO users (email, password) VALUES ('admin@example.com', 'adminpass')");
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
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
    const query = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;

    db.get(query, (err, row) => {
        if (row) {
            req.session.isAuthenticated = true;
            res.status(200).send('Success');
        } else {
            req.session.isAuthenticated = false;
            res.status(401).send('Unauthorized');
        }
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.send('File uploaded successfully!');
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('/login');
    });
});

app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
