const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const DEFAULT_PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// Helper to safely load file buffer
function getBuffer(relPath) {
  try {
    const full = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(full)) return fs.readFileSync(full);
  } catch (e) {}
  return null;
}

// In-memory static cache so Vercel Serverless NEVER fails with 404
const STATIC_CACHE = {};

function register(urlPath, relFilePath, mimeType) {
  const buf = getBuffer(relFilePath);
  if (buf) {
    STATIC_CACHE[urlPath] = { buf, mimeType };
  }
}

// Register all files and alternate paths
const fileMappings = [
  ['/', 'index.html', 'text/html; charset=utf-8'],
  ['/index.html', 'index.html', 'text/html; charset=utf-8'],
  ['/page1', 'page1.html', 'text/html; charset=utf-8'],
  ['/page1.html', 'page1.html', 'text/html; charset=utf-8'],
  ['/page2', 'page2.html', 'text/html; charset=utf-8'],
  ['/page2.html', 'page2.html', 'text/html; charset=utf-8'],
  ['/page3', 'page3.html', 'text/html; charset=utf-8'],
  ['/page3.html', 'page3.html', 'text/html; charset=utf-8'],
  ['/pdf-view', 'pdf-view.html', 'text/html; charset=utf-8'],
  ['/pdf-view.html', 'pdf-view.html', 'text/html; charset=utf-8'],
  ['/css/styles.css', 'css/styles.css', 'text/css; charset=utf-8'],
  ['/styles.css', 'css/styles.css', 'text/css; charset=utf-8'],
  ['/js/app.js', 'js/app.js', 'application/javascript; charset=utf-8'],
  ['/app.js', 'js/app.js', 'application/javascript; charset=utf-8'],
  ['/assets/images/page1.jpg', 'assets/images/page1.jpg', 'image/jpeg'],
  ['/page1.jpg', 'assets/images/page1.jpg', 'image/jpeg'],
  ['/assets/images/page2.jpg', 'assets/images/page2.jpg', 'image/jpeg'],
  ['/page2.jpg', 'assets/images/page2.jpg', 'image/jpeg'],
  ['/assets/images/page3.jpg', 'assets/images/page3.jpg', 'image/jpeg'],
  ['/page3.jpg', 'assets/images/page3.jpg', 'image/jpeg'],
  ['/assets/images/qr-code.svg', 'assets/images/qr-code.svg', 'image/svg+xml'],
  ['/qr-code.svg', 'assets/images/qr-code.svg', 'image/svg+xml'],
  ['/assets/images/qr-code.png', 'assets/images/qr-code.png', 'image/png'],
  ['/qr-code.png', 'assets/images/qr-code.png', 'image/png']
];

fileMappings.forEach(([url, rel, mime]) => register(url, rel, mime));

function requestHandler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (e) {
    parsedUrl = { pathname: req.url || '/' };
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);
  if (pathname === '' || pathname === '/') {
    pathname = '/index.html';
  }

  // 1. Check in-memory static cache first
  if (STATIC_CACHE[pathname]) {
    const item = STATIC_CACHE[pathname];
    res.writeHead(200, {
      'Content-Type': item.mimeType,
      'Content-Length': item.buf.length,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(item.buf);
    return;
  }

  // Also check without extension + .html
  if (STATIC_CACHE[pathname + '.html']) {
    const item = STATIC_CACHE[pathname + '.html'];
    res.writeHead(200, {
      'Content-Type': item.mimeType,
      'Content-Length': item.buf.length,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(item.buf);
    return;
  }

  // 2. Fallback to filesystem lookup
  const safePath = path.normalize(path.join(ROOT_DIR, pathname));
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(safePath).pipe(res);
  });
}

function startServer(port) {
  const server = http.createServer(requestHandler);

  server.listen(port, () => {
    console.log('====================================================');
    console.log(`?? Server running: http://localhost:${port}/`);
    console.log('====================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

// Start standalone server when executed directly
if (require.main === module) {
  startServer(DEFAULT_PORT);
}

// Export handler for Vercel Serverless Function compatibility
module.exports = requestHandler;
