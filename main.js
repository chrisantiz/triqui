const app = require('./src/app'),
    server = require('http').Server(app),
    io = require('socket.io')(server);

/* ------- Sockets ------- */
/* En la ruta /home */
require('./src/server/sockets/home')(io);
/* En la ruta /play */
require('./src/server/sockets/play')(io);

server.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});