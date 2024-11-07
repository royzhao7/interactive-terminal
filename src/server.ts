import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { handleTerminalConnection, setSharedTerminalMode } from './terminal.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//console.log(__dirname)

// Config
setSharedTerminalMode(false); // Set this to false to allow a shared session
const port = 6060;
const hostname='localhost';

const server = http.createServer((req, res) => {
    // res.writeHead(200, { 'Content-Type': 'text/plain' });
    // res.end('HTTP server is running.\n');
    if (req.method === 'GET') {
        const routeName = req.url?.slice(1)||"";
       // console.log('routeName:'+routeName)
        const assetObj = {
            '': { file: "index.html", contentType: "text/html" },
             'client.js': { file: "client.js", contentType: "text/javascript" }
        }[routeName];

      //  console.log('assetObj:'+assetObj?.file)
        if (!assetObj) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Path not found');
        }

        const filePath = path.join(__dirname, assetObj.file);

        fs.readFile(filePath, (err, data) => {
            // console.log('readFile:'+filePath)
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Failed to load file');
            } else {
                res.writeHead(200, { 'Content-Type': assetObj.contentType });
                res.end(data);
            }
        });
    }
});

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', handleTerminalConnection);

server.on('upgrade', (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        console.log('upgrade')
        wss.emit('connection', ws, request);
    });
});

server.listen(port, () => {
    console.log(`HTTP and WebSocket server is running on  http://${hostname}:${port}/`);
});
