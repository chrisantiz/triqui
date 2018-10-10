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

module.exports = {
    selectAll,
    users,
    insert,
    login
}