const Santz = require('./database');
const table = 'users';
function PointError() {
    this.status = 500;
    this.points = null;
}
function CreateDataError() {
    this.status = 500;
}
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
    login( { nick, pass } ) {
        return Santz.select('id', 'nick').from(table).where('nick', nick).and('pass', pass).exec();
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
    getMatch(id) {
        return Santz.select('pj', 'pg', 'pp', 'pe', 'pi').from(table).where('id', id).exec();
    },
    /* Actualizar información de las partidas */
    setMatch({ id, data }) {
        return Santz.update(table).values(data).where('id', id).exec();
    },
    /* Almacenar los resultados de una partida en concreto */
    setHistory(data) {
        /* local, visit, winner, _date */
        return Santz.insert('history').values(data).exec();
    },
    /* Obtener información de las partidas jugadas */
    getHistory( { id = null, nick = null } ) {
        /* Cuando se quiere ver el resultado de una partida en específico */
        if(id && typeof id === 'number') {
            return Santz.select('*').from('history').where('id', id).exec();
        }
        /* Cuando se quiere el historial de cierto usuario */
        if (nick && typeof nick === 'string') {
            return Santz.select('id', 'local', 'visit').from('history')
                        .where('local', nick).or('visit', nick).exec();
        }
        /* Cuando se quiere obtener las últimas 20 partidas */
        if(id === null && nick === null) {
            return Santz.select('id', 'local', 'visit').from('history').limit(20).exec();
        }
    }
}