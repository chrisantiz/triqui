// Métodos persistencia de datos en MYSQL
const model = require('./model');
// Métodos JsonWebToken
const jwt = require('./jwt');

// Devolver todos los usarios
const selectAll = (req, res) => {
    model.select()
        .then(data => {
            res.json(data);
        })
}
// Agregar nuevo usuario
const insert = (req, res) => {
    let {data} = req.body;
    model.insert(data)
        .then(data => {
            if (data.affectedRows === 1) {
                res.json({status: 'ok'})
            } else {
                res.json({status: 'fail'})
            }
        })
}

const users = async () => {
    let data = await model.select();
    return data;
}
// Método para logearse
const login  = (req, res) => {
    model.login(req.body)
        .then(data => {
            let user;
            if(data.length) {
                user = data[0];
                let token = jwt.create(user, 'day', 15);
                user.token = token;
            }
            res.json(user);
        })
}
/* Actualizar los puntos de un jugador luego de partida jugada */
const points = async (req, res) => {
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
};

module.exports = {
    selectAll,
    users,
    insert,
    login,
    points
}