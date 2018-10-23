const Router = require('express').Router();
// Controladores
const ctrl = require('./server/controller');
// Middleware autenticador
const auth = require('./server/auth');
// Arreglo que contendrá información acerca de los duelos activos
let arrGames = require('./server/events');
// Verificar si el nickname de un usuario a registrarse ya existe
const validateUser = async (nick) => {
    let data = await ctrl.users();
    return data.filter(user => user.nick === nick);
}
/* ------------------------ RUTAS ------------------------- */
Router
    // Verificar token y rutas activas
    .post('/token', auth, (req, res) => {
        // Si se envío una ruta se comprueba
        if(req.body.path) {
            let index = arrGames.findIndex( dt => dt.path === req.body.path)
            if(index !== -1) {
                // Ruta válida
                res.json({
                    auth: res.auth,
                    status: 1
                });
                // Ruta inválida
            } else {
                res.json({
                    auth: res.auth,
                    status: 0
                });
            }
        // Cuando solo se quiere saber sobre el token
        } else {
            res.json({auth: res.auth});
        }
    })
    // Verificar la existencia de un usuario
    .post('/validate', async (req, res) => {
        let {username} = req.body;
        let arrUser = await validateUser(username);

        if (arrUser.length === 1) {
            res.json({exists: true});
        } else {
            res.json({exists: false});
        }
    })
    // Comprobar credenciales de un usuario
    .post('/login', ctrl.login)
    // Agregar nuevo usuario
    .post('/insert', ctrl.insert)
    /* Actualizar los puntos de un jugador luego de una partida */
    .put('/points', auth, ctrl.points)
    // Obtener todos los usuarios
    .get('/users', ctrl.selectAll)

module.exports = Router;