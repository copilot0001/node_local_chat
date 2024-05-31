const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

// Array to store old messages
const messageHistory = [];

wss.on('connection', (ws) => {
  console.log('A new client connected');

  // Send the message history to the new client
  messageHistory.forEach((message) => {
    ws.send(message);
  });

  // Send a welcome message to the new client
  ws.send('Welcome to the WebSocket server!');

  ws.on('message', (message) => {
    console.log('Received: %s', message);

    // Store the new message in the history
    messageHistory.push(message);

    // Broadcast the message to all clients, including the sender
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Function to get local network IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = 8080;
const LOCAL_IP = getLocalIp();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on http://${LOCAL_IP}:${PORT}`);
});
