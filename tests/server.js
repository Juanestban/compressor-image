const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const hostname = '127.0.0.1';
const port = 3500;

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/public/')) {
    serveStaticFile(req, res, req.url.replace('/public', '')); // Elimina '/archivos/' del URL
  } else {
    serveStaticFile(req, res);
  }
});

function serveStaticFile(req, res, customPath = null) {
  let filePath = path.join(__dirname, customPath ? customPath : req.url);

  if (filePath === path.join(__dirname, '/')) {
    filePath = path.join(__dirname, 'index.html');
  }

  try {
    const data = fs.readFileSync(filePath);
    const extname = path.extname(filePath);
    const contentType = getContentType(extname);

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Archivo no encontrado');
  }
}

function getContentType(extname) {
  switch (extname) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    default:
      return 'text/plain';
  }
}

server.listen(port, hostname, () => {
  console.log(`server running at http://${hostname}:${port}`);
});
