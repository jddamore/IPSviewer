import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import express from 'express';

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

const __dirname = path.resolve();
const buildDir = path.join(__dirname, 'build');
const index = fs.readFileSync(path.join(buildDir, '404.html'), 'utf-8');
const appDir = path.join(buildDir, '_app');

const app = express();

// classic version
const classic = fs.readFileSync('./classic/ips_main.html', 'utf-8');
const favicon = fs.readFileSync('./classic/favicon.ico');


let privateKey; 
let certificate;
let ca;
let credentials;
if  (fs.existsSync('./certs/ipsviewer2023.key') && fs.existsSync('./certs/ipsviewer2023.crt') && fs.existsSync('./certs/ipsviewer2023.ca-bundle') ) {
  privateKey  = fs.readFileSync('./certs/ipsviewer2023.key', 'utf-8');
  certificate = fs.readFileSync('./certs/ipsviewer2023.crt', 'utf-8');
  ca = fs.readFileSync('./certs/ipsviewer2023.ca-bundle', 'utf-8')
  credentials = {key: privateKey, cert: certificate, ca: ca};
}

app.use('/', express.static(appDir, { immutable: true, maxAge: '1y' }));

app.use(express.static(buildDir));

app.use('/classic/templates', express.static('classic/templates'));
app.use('/classic/assets', express.static('classic/assets'));

app.get('/classic', (req, res) => {
  res.send(classic);
});

app.get(['/classic/favicon.ico'], (req, res) => {
  res.send(favicon);
});

// Catch-all route to serve `index.html` for SPA routing
app.get('/', (req, res) => {
  res.send(index);
});

var httpServer = http.createServer(app);
let httpsServer;
if (credentials) {
  httpsServer = https.createServer(credentials, app);
}

httpServer.listen(HTTP_PORT);
console.log(`listening on HTTP port ${HTTP_PORT}...`);
if (httpsServer) {
  httpsServer.listen(HTTPS_PORT);
  console.log('listening on HTTPS port ${HTTPS_PORT}...');
}
else console.log('HTTPS server not running...')
