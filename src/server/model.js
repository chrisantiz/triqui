const Santz = require('./database');
const table = 'users';

module.exports = {
    /* Obtener todos o un solo usuario */
    select(id) {
        if (typeof id === 'number') {
            return Santz.select('*').from(table).where('id', id).exec();
        }
        return Santz.select('*').from(table).exec();
    },
    /* Crear un nuevo usuario */
    insert(data) {
        return Santz.insert(table).values(data).exec();
    },
    /* Acceder al juego */
    login(nick) {
        return Santz.select('id', 'nick', 'pass').from(table).where('nick', nick).exec();
    },
    /* Obtener los puntos de un jugador */
    getPoints(id) {
        return Santz.select('points').from(table).where('id', id).exec();
    },
    /* Actualizar puntos luego de una partida jugada */
    setPoints(id, points) {
        return Santz.update(table).values({ points }).where('id', id).exec();
    },
    /* Obtener información de las partidas */
    getHistory(id) {
        return Santz.select('pj', 'pg', 'pp', 'pe', 'pi').from(table).where('id', id).exec();
    },
    /* Actualizar información de las partidas */
    setHistory(id, rows) {
        return Santz.update(table).values(rows).where('id', id).exec();
    }
}