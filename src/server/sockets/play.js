const event = require('../event');

const socketIO = io => {
    io.of('/play').on('connection', socket => {
        socket.on('joinroom', room => {
            socket.join(room);
            socket.room = room;
        });
        socket.on('timeout', nick => {
            socket.broadcast.to(socket.room).emit('timeout', nick);
            // socket.broadcast.emit('timeout', nick);
        });
        socket.on('again', data => {
            socket.broadcast.to(socket.room).emit('again', data);
            // socket.broadcast.emit('again', data);
        });
        socket.on('nextturn', data => {
            socket.broadcast.to(socket.room).emit('nextturn', data);
            // socket.broadcast.emit('nextturn', data);
        });
        socket.on('deletepath', path => {
            event.emit('deletepath', path);
        });
        socket.on('entry', nick => {
            socket.nick = nick;
            socket.broadcast.to(socket.room).emit('entry', nick);
            // socket.broadcast.emit('entry', nick);
        });
        socket.on('disconnect', () => {
            event.emit('left', socket.nick);
            socket.broadcast.to(socket.room).emit('userlogout');
            // socket.broadcast.to(socket.room).emit('userlogout', socket.nick);
            // socket.broadcast.emit('userlogout', socket.nick);
        });
    });
}
module.exports = socketIO;