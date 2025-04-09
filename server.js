const { PeerServer } = require('peer');
const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a PeerJS server
const peerServer = PeerServer({
  port: 9000,
  path: '/myapp',
  proxied: true
});

// Redirect all routes to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hamami server listening on port ${PORT}`);
});