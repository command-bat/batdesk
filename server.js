// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('stream', (data) => {
    // Aqui você pode processar os dados do stream, como salvar em um arquivo
    // ou retransmitir para outros clientes
    // Exemplo: salvar em um arquivo
    fs.appendFile('stream.webm', data, (err) => {
      if (err) console.error('Erro ao salvar o stream:', err);
    });

    // Ou retransmitir para outros clientes
    socket.broadcast.emit('stream', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
