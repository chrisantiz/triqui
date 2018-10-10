const event = require('./event');
// Arreglo información de los usuarios
let sUsers = [];
const socketIO = io => {
    io.on('connection', socket => {
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
        /* - Actualizar el estado de `batalla de los usuarios` - */
        socket.on('updateusers', nicks => {
            for (let index in sUsers) {
                for (let nick of nicks) {
                    if(sUsers[index].nick === nick) {
                        sUsers[index].fight = true;
                    }
                }
            }
            socket.emit('usersonline', sUsers);
            socket.broadcast.emit('usersonline', sUsers);
        })
        /* ------- Agregar una nueva ruta al arreglo de duelos activos ------- */
        socket.on('startgame', data => {
            // Emitir el evento al router de express con la ruta enviada
            event.emit('startgame', data);
        });
        socket.on('entry', nick => {
            socket.user = nick;
            event.emit('updatestate', nick);
            socket.broadcast.emit('entry', nick);
        });
        /* ----------- Agregar un nuevo usuario ----------- */
        socket.on('adduser', user => {
            socket.broadcast.emit('entry', user);
            // Nick del usuario actual
            socket.nick = user.nick;
            // Se busca si tal usuario ya estaba conectado
            let usr = sUsers.filter( usr => usr.nick === user.nick);
            // Si no lo estaba se agrega
            if (!usr.length) {
                // Se define la propiedad sessions en 1
                user.sessions = 1;
                sUsers.push(user);
            } else {
                // Si ya está conectado se le añade una nueva sesión
                for (let usr in sUsers) {
                    if(sUsers[usr].nick === user.nick) sUsers[usr].sessions++;
                }
            }
            socket.emit('usersonline', sUsers);
            socket.broadcast.emit('usersonline', sUsers);
        });
        /* ----------------- Petición de batalla ----------------- */    
        socket.on('challenge', info => {
            socket.broadcast.emit('challenge', info);
        });
        /* ------------ Respuesta de petición de batalla ------------ */
        socket.on('challengeresponse', info => {
            socket.broadcast.emit('challengeresponse', info);
        });
        /* ------------------ Cancelar un reto --------------------- */
        socket.on('cancelchallenge', user => {
            socket.broadcast.emit('cancelchallenge', user);
        });
        /* ---------------- Cerrado de sesión total ---------------- */
        socket.on('closesession', () => {
            let index = sUsers.findIndex( user => user.nick === socket.nick);
            sUsers.splice(index,1);
            socket.broadcast.emit('usersonline', sUsers);
            socket.emit('closesession', socket.nick);
            socket.broadcast.emit('closesession', socket.nick);
        });
        /* ------ Verificación al salir del navegador o pestaña ------ */
        socket.on('disconnect', () => {
            // console.log(`El usuario que sale es: ${socket.nick}`);
            const myUrl = new URL(socket.handshake.headers.referer);
            let pathname = myUrl.pathname.split('/')[1];
            if(pathname === 'play') {
                event.emit('left', socket.user);
                socket.broadcast.emit('userlogout', socket.user);
            }
            for (let usr in sUsers) {
                // Se busca las sesiones activas del usuario actual
                if(sUsers[usr].nick === socket.nick) {
                    // Si solo tiene una se quita de los usuarios activos
                    if (sUsers[usr].sessions === 1) {
                        // Posición en el arreglo
                        let index = sUsers.findIndex( user => user.nick === socket.nick);
                        sUsers.splice(index,1);
                        socket.broadcast.emit('usersonline', sUsers);
                        break;
                    } else {
                        // Si tiene más se le quita la sesión actual
                        sUsers[usr].fight = false;
                        sUsers[usr].sessions--;
                        break;
                    }
                }
            }
        })
    });
}
module.exports = socketIO;