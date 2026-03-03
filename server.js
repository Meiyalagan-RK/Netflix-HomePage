const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const contentPath = path.join(publicDir, 'data', 'content.json');
const subscriptions = [];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const loadContent = () => JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
};

const serveStaticFile = (reqPath, res) => {
  const safePath = reqPath === '/' ? '/index.html' : reqPath;
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath)) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
  return true;
};

const server = http.createServer((req, res) => {
  if (!req.url) return;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (parsedUrl.pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { status: 'ok', service: 'netflix-homepage-api' });
  }

  if (parsedUrl.pathname === '/api/content' && req.method === 'GET') {
    return sendJson(res, 200, loadContent());
  }

  if (parsedUrl.pathname === '/api/search' && req.method === 'GET') {
    const query = (parsedUrl.searchParams.get('q') || '').toLowerCase().trim();
    if (!query) return sendJson(res, 400, { error: 'Query param q is required' });

    const { rows } = loadContent();
    const results = rows.flatMap((row) => row.items).filter((item) => item.name.toLowerCase().includes(query));
    return sendJson(res, 200, { count: results.length, results });
  }

  if (parsedUrl.pathname === '/api/subscribe' && req.method === 'POST') {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', () => {
      let body;
      try {
        body = JSON.parse(rawBody || '{}');
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }

      const { email, plan } = body;

      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return sendJson(res, 400, { error: 'Valid email is required' });
      }

      if (!plan || !['mobile', 'basic', 'standard', 'premium'].includes(plan)) {
        return sendJson(res, 400, { error: 'Plan must be one of mobile/basic/standard/premium' });
      }

      subscriptions.push({ email, plan, subscribedAt: new Date().toISOString() });
      return sendJson(res, 201, { message: 'Subscription created', email, plan });
    });
    return;
  }

  if (!serveStaticFile(parsedUrl.pathname, res)) {
    serveStaticFile('/index.html', res);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
