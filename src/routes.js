const Router = require('express').Router();
/* Controladores */
const ctrl = require('./server/controller');
/* Middleware autenticador */
const auth = require('./server/auth');

/* ------------------------ RUTAS ------------------------- */
Router
    /* ------- POST ------- */
    /* Verificar token y rutas activas */
    .post('/token', auth, ctrl.token)
    /* Verificar si el nick a crear ya existe */
    .post('/validate', ctrl.validate)
    /* Comprobar credenciales de un usuario */
    .post('/login', ctrl.login)
    /* Agregar nuevo usuario */
    .post('/insert', ctrl.insert)
    /* ----- FIN POST ----- */

    /* ------- PUT ------- */
    /* Actualizar los puntos de un jugador luego de una partida */
    .put('/points', auth, ctrl.setPoints)
    /* Modificar historial de datos de las partidas */
    .put('/match', auth, ctrl.setMatch)
    /* ----- FIN PUT ----- */

    /* ------- GET ------- */
    /* Obtener todos los usuarios */
    .get('/users', auth, ctrl.selectAll)
    /* Obtiene los puntos de un jugador */
    .get('/points/:id', auth, ctrl.getPoints)
    /* Obtener información del historial de partidas */
    .get('/match/:id', auth, ctrl.getMatch)
    /* ----- FIN GET ----- */

    /* ------- DELETE ------- */
    /* ----- FIN DELETE ----- */

module.exports = Router;