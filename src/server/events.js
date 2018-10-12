// Arreglo con las partidas activas
let games = [];
// Emisor y receptor de eventos (recibir desde el socket una nueva url)
const event = require('./event');
// Escuchar el evento
event.on('startgame', data => {
    let index = games.findIndex( dt => dt.path === data.path);
    // Agregarse solo cuando no exista
    if(index === -1) games.push(data);
});
event.on('left', user => { 
    /* Índice en el arreglo del usuario saliente */
    let index = games.findIndex( game => {
        return (game.p1.nick === user || game.p2.nick === user);
    });
    /* Cuando el usuario ha sido encontrado */
    if (index !== -1) {
        /* Se actualiza su estado de online a offline */
        if (games[index].p1.nick === user)  {
            games[index].p1.status = 0;
        } else {
            games[index].p2.status = 0;
        }
        /* Cuando los dos usuarios hayan salido la partida habrá terminado */
        if (games[index].p1.status === 0 && games[index].p2.status === 0) {
            console.log('Los dos usuarios han salido\neliminando la ruta');
            console.log(games[index].path);
            games.splice(index, 1);
        }
    }
});
/* Volver activo a un usuario cuando se vuelve a conectar mientras la partida aún existe */
event.on('updatestate', user => {
    /* Índice en el arreglo del usuario entrante */
    let index = games.findIndex( game => {
        return (game.p1.nick === user || game.p2.nick === user);
    });
    /* Cuando el usuario ha sido encontrado */
    if (index !== -1) {
        if (games[index].p1.nick === user)  {
            games[index].p1.status = 1;
        } else {
            games[index].p2.status = 1;
        }
    }
});
/* Eliminar la ruta de una partida cuando alguno de los dos jugadores se desconecta y no vuelve */
event.on('deletepath', path => {
    let index = games.findIndex( dt => dt.path === path);
    if(index >= 0) {
        games.splice(index, 1);
    };
})
/* Exportar el arreglo para comprobar las rutas de partidas que siguen, o no, activas desde ´routes´ mediante peticiones AJAX */
module.exports = games;