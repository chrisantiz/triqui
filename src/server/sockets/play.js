const event = require('../event');

const socketIO = io => {
    io.of('/play').on('connection', socket => {
        socket.on('joinroom', room => {
            socket.join(room);
            socket.room = room;
        });
        socket.on('forceleft', path => {
            socket.broadcast.to(socket.room).emit('forceleft');
            event.emit('deletepath', path);
        });
        socket.on('timeout', nick => {
            socket.broadcast.to(socket.room).emit('timeout', nick);
        });
        socket.on('again', data => {
            socket.broadcast.to(socket.room).emit('again', data);
        });
        socket.on('nextturn', data => {
            socket.broadcast.to(socket.room).emit('nextturn', data);
        });
        socket.on('deletepath', path => {
            event.emit('deletepath', path);
        });
        socket.on('entry', nick => {
            socket.nick = nick;
            socket.broadcast.to(socket.room).emit('entry', nick);
            event.emit('updatestate', nick);
        });
        /* -------------------- Chat ----------------------- */
        socket.on('newmessage', message => {
            socket.broadcast.to(socket.room).emit('newmessage', message);
        });
        socket.on('typing', () => {
            socket.broadcast.to(socket.room).emit('typing');
        });
        socket.on('stoptyping', () => {
            socket.broadcast.to(socket.room).emit('stoptyping');
        });
        socket.on('disconnect', () => {
            event.emit('left', socket.nick);
            socket.broadcast.to(socket.room).emit('userlogout');
        });
    });
}
module.exports = socketIO;