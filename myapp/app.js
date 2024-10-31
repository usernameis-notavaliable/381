const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Item = require('./models/Item');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieSession({
    name: 'session',
    keys: ['your_secret_key'],
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection (replace 'your_database' with actual database name)
mongoose.connect('mongodb+srv://', { useNewUrlParser: true, useUnifiedTopology: true });

// Routes

// Home page
app.get('/', (req, res) => {
    res.render('index');
});

// Login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Register page
app.get('/register', (req, res) => {
    res.render('register');
});

// Dashboard (CRUD operations)
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    
    const items = await Item.find();
    res.render('dashboard', { items });
});

// Login functionality
app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).send('Invalid credentials');
    }
    
    req.session.userId = user._id;
    res.redirect('/dashboard');
});

// Register functionality
app.post('/register', async (req, res) => {
    const newUser = new User({ username: req.body.username, password: req.body.password });
    await newUser.save();
    res.redirect('/login');
});

// Logout functionality
app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

// CRUD Operations

// Create Item - GET form page
app.get('/item/new', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    
    res.render('itemForm', { item: {} });
});

// Create Item - POST action
app.post('/item', async (req, res) => {
    const item = new Item(req.body);
    await item.save();
    res.redirect('/dashboard');
});

// Update Item - GET form page
app.get('/item/edit/:id', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const item = await Item.findById(req.params.id);
    res.render('itemForm', { item });
});

// Update Item - PUT action
app.put('/item/:id', async (req, res) => {
    await Item.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/dashboard');
});

// Delete Item - DELETE action
app.delete('/item/:id', async (req, res) => {
    await Item.findByIdAndRemove(req.params.id);
    res.redirect('/dashboard');
});

// RESTful APIs

// Create API (GET method)
app.get('/api/items/new', (req, res) => {
    // Return a form or message for creating an item.
});

// Read API (POST method)
app.post('/api/items/read', async (req, res) => {
    const items = await Item.find(req.body); // Query based on request body.
    res.json(items);
});

// Update API (PUT method)
app.put('/api/items/update/:id', async (req, res) => {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body);
    res.json(updatedItem);
});

// Delete API (DELETE method)
app.delete('/api/items/delete/:id', async (req, res) => {
    await Item.findByIdAndRemove(req.params.id);
    res.status(204).send(); // No content response.
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
