const bcrypt = require('bcryptjs');
/* Métodos persistencia de datos en MYSQL */
const model = require('./model');
/* Métodos JsonWebToken */
const jwt = require('./jwt');
/* Arreglo que contendrá información acerca de los duelos activos */
let arrGames = require('./events');
/* Funciones de ayuda */
const { apiResponse } = require('./helpers');

module.exports = {
    /* ---------- Validación del token ---------- */
    token(req, res) {
        /* Si se envío una ruta se comprueba */
        if (req.body.id) {
            let index = arrGames.findIndex(dt => dt.id === req.body.id)
            if (index !== -1) {
                /* Ruta válida */
                res.json({
                    status: 1,
                    auth: res.auth
                });
                /* Ruta inválida */
            } else {
                res.json({
                    status: 0,
                    auth: res.auth
                });
            }
            /* Cuando solo se quiere saber sobre el token */
        } else {
            res.json({ auth: res.auth });
        }
    },
    /* -------- Verificar si el nick del usuario a crear ya existe -------- */
    async validate(req, res) {
        try {
            let { username } = req.body,
                data = await model.select(),
                arrUser = data.filter(user => user.nick === username);
            /* Si se obtiene datos es porque existe */
            if (arrUser.length === 1) {
                res.json({ exists: true });
            } else {
                res.json({ exists: false });
            }
        } catch (err) {
            res.json(err);
        }
    },
    /* ---------- Método para logearse ---------- */
    async login(req, res) {
        try {
            let data = await model.login(req.body.nick);
            let user = {};
            /* Cuando se ha obtenido información del usuario solicitado */
            if (data.length) {
                user = data[0];
                const hash = user.pass;
                if (bcrypt.compareSync(req.body.pass, hash)) {
                    const token = jwt.create(user);
                    user.token = token;
                    user.status = 200;
                } else {
                    user.status = 500;
                }
            /* Cuando las credenciales son incorrectas */
            } else {
                user.status = 500;
            }
            res.json(user);
        } catch (err) {
            res.json(err);
        }
    },
    /* ---------- Agregar un nuevo usuario ---------- */
    async insert(req, res) {
        /* Obtención de los datos a insertar */
        let { data } = req.body;
        try {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(data.pass, salt);
            data.pass = hash;
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
            res.json(err);
        }
    },
    async getPoints(req, res) {
        if (res.auth.entry) {
            try {
                let result = await model.getPoints(req.params.id);
                let points = parseInt(result[0].points);
                res.json(apiResponse(200, false, false, { points }));
            } catch (err) {
                res.json(apiResponse(500, false, false));
            }
        } else {
            res.json(res.auth);
        }
    },
    /* --- Actualizar los puntos de un jugador luego de partida jugada ---- */
    async setPoints(req, res) {
        /* Validar si el usuario está logeado */
        if (res.auth.entry) {
            try {
                let { id, points } = req.body;
                /* Consultar los puntos actuales */
                let getResult = await model.getPoints(id);
                let myPoints = getResult[0].points;
                points = parseInt(points);
                /* Cuando tenga cero puntos y haya perdido */
                if (myPoints < 1 && points === 2) {
                    return res.json(apiResponse(200, false, false, { points: 0 }));
                } else {
                    /* Cuando se ha ganado o empatado */
                    if (points !== 2) {
                        myPoints += points;
                    } else {
                        /* Cuando se pierde */
                        myPoints -= points;
                        /* Colocar a cero cuando el resultado es negativo */
                        if (myPoints < 0) myPoints = 0;
                    }
                }
                /* Ejecutar sentencia SQL para actualizar los puntos */
                try {
                    /* Respuesta de la sentencia SQL */
                    let setResult = await model.setPoints(id, myPoints);
                    let resolve = {};
                    /* Verificar si se ha modificado una fila */
                    if (setResult.changedRows === 1) {
                        resolve = apiResponse(200, false, true, { points: myPoints });
                    } else {
                        resolve = apiResponse(500, false, false, { points: null });
                    }
                    res.json(resolve);
                } catch (err) {
                    res.json(apiResponse(500, false, false));
                }
            } catch (err) {
                res.json(apiResponse(500, false, false));
            }
        } else {
            res.json(res.auth);
        }
    },
    /* Obtener datos de las partidas */
    async getHistory(req, res) {
        if (res.auth.entry) {
            try {
                let result = await model.getHistory(req.params.id);
                res.json(apiResponse(200, false, false, result[0]));
            } catch (err) {
                res.json(apiResponse(500, false, false));
            }
        } else {
            res.json(res.auth);
        }
    },
    /* Cambiar información de las partidas */
    async setHistory(req, res) {
        if (res.auth.entry) {
            try {
                /* Nombre de la columna a incrementar */
                const { affectRow } = req.body;
                const { id } = req.body;
                /* Nuevos datos a insertar en base de datos */
                let rows = {};
                /*
                 Incrementar el valor de ciertas columnas sin necesitad de obtener sus valores
                 anteriores mediante otra petición a la base de datos
                */
                /* Siempre se incrementará en 1 la columna «pj» */
                rows.pj = { toSqlString: () => '`pj` + 1' };
                /* Nombres de las columnas acceptadas */
                const columns = ['pg','pp','pe','pi'];
                /* Verificar si la columna enviada corresponde a una en la base de datos */
                const columnName = columns.find( column => affectRow === column);
                if (columnName) {
                    /* Agregarle una nueva propiedad que corresponda al nombre de tal columna */
                    rows[affectRow] = { toSqlString: () => `${columnName} + 1` };
                } else {
                    return res.json(apiResponse(404, false, false));
                }
                let result = await model.setHistory(id, rows);
                /* Cuando una fila ha sido modificada */
                if(result.changedRows === 1) {
                    res.json(apiResponse(200, false, true));
                } else {
                    res.json(apiResponse(500, false, false));
                }
            } catch (err) {
                res.json(apiResponse(500, false, false));
            }
        } else {
            res.json(res.auth);
        }
    },
    /* ---------- Obtener todos los usuarios ---------- */
    async selectAll(req, res) {
        try {
            let data = await model.select();
            res.json(data);
        } catch (err) {
            res.json(err);
        }
    }
};