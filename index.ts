import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer(function (request: any, response: any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.end('Hello World');
});

const wss = new WebSocketServer({ server });
let ucout = 0;
wss.on('error', console.error);

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data, isBinary) {
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });

    console.log("user connected", ++ucout);
    ws.send('Hello! You are connected to the server');
});

server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

// import express from 'express';
// import { WebSocketServer, WebSocket } from 'ws';

// const app = express();

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// let httpServer = app.listen(4000, () => {
//   console.log('Server is listening on port 4000');
// });

// const wsServer = new WebSocketServer({ server: httpServer });

// wsServer.on('connection', function connection(ws) {
//   ws.on('message', function message(data, isBinary) {
//     console.log('received: %s', data);
//   });
// });
