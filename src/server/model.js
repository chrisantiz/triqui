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
    login( { nick, pass } ) {
        return Santz.select('id', 'nick').from(table).where('nick', nick).and('pass', pass).exec();
    },
    /* Actualizar puntos luego de una partida jugada */
    async points( { nick, points } ) {
        try {
            points = parseInt(points);
            /* Obtener los puntos actuales del jugador */
            let total = await Santz.select('points').from(table).where('nick', nick).exec();
            let myPoints = parseInt(total[0].points);
            /* Cuando tenga cero puntos y haya perdido */
            if (myPoints < 1 && points === 2) {
                return { status: 200, points: myPoints };
            } else {
                /* Cuando se ha ganado o empatado */
                if (points !== 2) {
                    myPoints += points;
                } else {
                    /* Cuando se pierde */
                    myPoints -= points;
                    /* Colocar a cero cuando el resultado es negativo */
                    if (myPoints < 0) {
                        myPoints = 0;
                    }
                }
                /* Actualizar los puntos */
                try {
                    /* Respuesta de la sentencia SQL */
                    let result = await Santz
                                        .update(table)
                                        .values( {points: myPoints} )
                                        .where('nick', nick)
                                        .exec();
                    let exp = {};
                    /* Verificar si se ha modificado una fila */
                    if (result.changedRows === 1) {
                        exp = { status: 200, points: myPoints };
                    } else {
                        exp = { status: 500, points: null };
                    }
                    return exp;
                } catch (err) {
                    return { status: 500, points: null };
                }
            }
        } catch (err) {
            return { status: 500, points: null };
        }
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