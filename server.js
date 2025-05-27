const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

const broadcasts = {}; // { id: { socketId, name } }

io.on('connection', (socket) => {
    console.log('Novo cliente conectado');

    socket.on('getBroadcasts', () => {
        socket.emit('broadcasts', broadcasts);
    });


    socket.on('broadcaster', ({ name }) => {
        const id = uuidv4();
        broadcasts[id] = { socketId: socket.id, name };
        socket.broadcast.emit('broadcasts', broadcasts);
        socket.emit('broadcast-id', id);
    });

    socket.on('watcher', (broadcastId) => {
        const broadcast = broadcasts[broadcastId];
        if (broadcast) {
            socket.to(broadcast.socketId).emit('watcher', socket.id);
        }
    });

    socket.on('offer', (id, message) => {
        socket.to(id).emit('offer', socket.id, message);
    });

    socket.on('answer', (id, message) => {
        socket.to(id).emit('answer', socket.id, message);
    });

    socket.on('candidate', (id, message) => {
        socket.to(id).emit('candidate', socket.id, message);
    });

    socket.on('disconnect', () => {
        const broadcastId = Object.keys(broadcasts).find(
            id => broadcasts[id].socketId === socket.id
        );
        if (broadcastId) {
            delete broadcasts[broadcastId];
            io.emit('broadcasts', broadcasts);
        } else {
            Object.values(broadcasts).forEach(b => {
                socket.to(b.socketId).emit('disconnectPeer', socket.id);
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
