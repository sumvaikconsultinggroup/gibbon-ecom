const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({ target: 'http://127.0.0.1:3000' });

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  res.writeHead(502, { 'Content-Type': 'text/plain' });
  res.end('Bad Gateway');
});

const server = http.createServer((req, res) => {
  console.log(`Proxying: ${req.method} ${req.url}`);
  proxy.web(req, res);
});

server.listen(8001, '0.0.0.0', () => {
  console.log('Proxy server running on port 8001 -> forwarding to 3000');
});
