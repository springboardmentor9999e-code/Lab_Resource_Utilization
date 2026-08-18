const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
const LOG_FILE = path.join(__dirname, 'client-errors.log');

const server = http.createServer((req, res) => {
  // Set CORS headers so browser can POST to this local server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const errorData = JSON.parse(body);
        const logLine = `[${new Date().toISOString()}] ERROR:\n${JSON.stringify(errorData, null, 2)}\n\n`;
        console.log("=== RECEIVED CLIENT ERROR ===");
        console.log(body);
        console.log("=============================");
        fs.appendFileSync(LOG_FILE, logLine);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Logged');
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Error logging server is active.');
  }
});

server.listen(PORT, () => {
  console.log(`Error receiver server listening on http://localhost:${PORT}`);
});
