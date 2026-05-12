require('dotenv').config();

const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const PORT     = 3000;
const API_KEY = process.env.GROQ_KEY;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/recommend') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {

      let payload;
      try { payload = JSON.parse(body); } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      if (!API_KEY || API_KEY === 'xxxxxxxxxxxxxxxxxxxxxxxxxx') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No Groq API key set. Open server.js and paste your key.' }));
        return;
      }

      const postData = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: payload.prompt }],
        temperature: 0.7,
        max_tokens: 2000
      });

      const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'Authorization':  `Bearer ${API_KEY}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          console.log('Groq status:', apiRes.statusCode);

          let parsed;
          try { parsed = JSON.parse(data); } catch {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Could not parse Groq response' }));
            return;
          }

          if (parsed.error) {
            console.log('Groq error:', parsed.error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: parsed.error.message }));
            return;
          }

          const text = parsed?.choices?.[0]?.message?.content;
          if (!text) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Empty response from Groq.' }));
            return;
          }

          console.log('✅ Groq success!');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ content: [{ text }] }));
        });
      });

      apiReq.on('error', err => {
        console.error('Network error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Network error: ' + err.message }));
      });

      apiReq.write(postData);
      apiReq.end();
    });
    return;
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');

  if (!API_KEY) {
    console.error("❌ Missing GROQ API key in .env");
    console.log('  ⚠️  No Groq API key found!');
    console.log('  👉  Get a FREE key at: https://console.groq.com');
    console.log('  📝  Then open .env and set GROQ_KEY=YOUR_KEY');
    process.exit(1);
  } else {
    console.log('  ✅  AcadAI is running with Groq AI (Free)!');
  }

  console.log(`  👉  Open in browser: http://localhost:${PORT}`);
  console.log('');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});