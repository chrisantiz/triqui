const app = require('./src/app'),
    server = require('http').Server(app),
    io = require('socket.io')(server);

// Todo lo referente a socket.io
require('./src/server/socket')(io);

server.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});