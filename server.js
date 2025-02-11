const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080; // Render assigns a dynamic PORT

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Simple API route for testing
app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello from Render's Express.js Server!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
