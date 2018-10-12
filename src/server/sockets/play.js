const event = require('../event');
const socketIO = io => {
    io.of('/play').on('connection', socket => {
        /* -------------------- JUEGO ------------------------ */
        socket.on('timeout', nick => {
            socket.broadcast.emit('timeout', nick);
        });
        socket.on('again', data => {
            socket.broadcast.emit('again', data);
        });
        socket.on('nextturn', data => {
            socket.broadcast.emit('nextturn', data);
        });
        socket.on('deletepath', path => {
            event.emit('deletepath', path);
        });
        socket.on('entry', nick => {
            socket.user = nick;
            event.emit('updatestate', nick);
            socket.broadcast.emit('entry', nick);
        });
        socket.on('disconnect', () => {
            console.log('Entró en play');
            event.emit('left', socket.user);
            socket.broadcast.emit('userlogout', socket.user);
        });
    });
}
module.exports = socketIO;