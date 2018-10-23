// Métodos persistencia de datos en MYSQL
const model = require('./model');
// Métodos JsonWebToken
const jwt = require('./jwt');

module.exports = {
    async selectAll(req, res) {
        try {
            let data = await model.select();
            // data.status = 200;
            res.json(data);
        } catch (err) {
            res.json(new Error(err));
        }
    },
    // Agregar nuevo usuario
    async insert(req, res) {
        /* Obtención de los datos a insertar */
        let { data } = req.body;
        try {
            let result = await model.insert(data);
            let exp = {};
            /* Verificar si se ha afectado alguna fila */
            if (result.affectedRows === 1) {
                /* Status de creado */
                exp = { status: 201 };
            } else {
                exp = { status: 500 };
            }
            res.json(exp);
        } catch (err) {
            res.json(new Error(err));
        }
    },
    async users() {
        try {
            return await model.select();
        } catch (err) {
            return new Error(err);
        }
    },
    // Método para logearse
    async login(req, res) {
        try {
            let data = await model.login(req.body);
            let user = {};
            /* Cuando se ha obtenido información del usuario solicitado */
            if (data.length) {
                user = data[0];
                const token = jwt.create(user, 'day', 15);
                user.token = token;
                user.status = 200;
            /* Cuando las credenciales son incorrectas */
            } else {
                user.status = 500;
            }
            res.json(user);
        } catch (err) {
            res.json(new Error(err));
        }
    },
    /* Actualizar los puntos de un jugador luego de partida jugada */
    async points(req, res) {
        /* Verificar que quien haga la petición sea un usuario logeado */
        if (res.auth.entry) {
            try {
                /* req.body = {nick:xxx, points:x} */
                let data = await model.points(req.body);
                res.json(data);
            } catch (err) {
                res.json(err);
            }
        } else {
            res.json(res.auth);
        }
    }
};