const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Disable cache for all responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - serve index.html for all routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});