import http from 'http';
import httpProxy from 'http-proxy';
import dns from 'dns/promises';

const { TARGET, PORT = 80 } = process.env;

if (! TARGET) {
    console.error('Please specify TARGET');
    process.exit(1);
}

let servers = [];

// Function to update the list of server IPs from DNS records
const updateServers = async () => {
    const entries = await dns.lookup(TARGET, { all: true });
    servers = entries.map(entry => `http://[${entry.address}]`);
};

// Update servers every minute
setInterval(updateServers, 1000);
updateServers();

const proxy = httpProxy.createProxyServer();

const server = http.createServer((req, res) => {
    if (servers.length === 0) {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('No servers available');
        return;
    }

    // Round-robin load balancing
    const target = servers.shift();
    servers.push(target);

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Log the request method and URL for debugging
    console.log(`Proxying request: ${req.method} ${url.pathname} -> ${target}`);

    proxy.web(req, res, { target }, (e) => {
        console.error('Proxy error:', e);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad gateway');
    });
});

server.listen(PORT, () => {
    console.log('Load balancer is ready to handle requests');
});