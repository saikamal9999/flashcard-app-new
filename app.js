const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;

// In-memory store for users (for demo purposes)
const users = [];

// Cybersecurity flashcards
const flashcards = [
    {
        question: "What is phishing?",
        answer: "Phishing is a social engineering attack used to steal user data like login credentials."
    },
    {
        question: "What is ransomware?",
        answer: "Ransomware is malware designed to block access to your system until a ransom is paid."
    },
    {
        question: "What is a firewall?",
        answer: "A firewall is a security system that monitors and controls incoming/outgoing network traffic."
    },
    {
        question: "What is two-factor authentication?",
        answer: "Two-factor authentication adds a second layer of security beyond just a password."
    }
];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// Registration page
app.get('/register', (req, res) => {
    res.render('register', { message: null });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.render('register', { message: 'User already exists!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { message: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.render('login', { message: 'Invalid username or password!' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.render('login', { message: 'Invalid username or password!' });
    }
    req.session.userId = username;
    res.redirect('/game');
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Flashcard game page (protected)
app.get('/game', isAuthenticated, (req, res) => {
    res.render('game', { flashcards, user: req.session.userId });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
    // Redirect to the login page if not logged in, or serve a custom landing page.
    res.redirect('/login');
});
