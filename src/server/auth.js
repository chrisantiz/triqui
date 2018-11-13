const jwt = require('./jwt');
module.exports = async (req, res, next) => {
    if (!req.headers['authorization']) {
        res.auth = {
            entry: false,
            data: null,
            status: {
                code: 401,
                message: 'UNAUTHORIZED'
            }
        }
        next();
    } else {
        /* Token enviado por el usuario */
        const token = req.headers['authorization'].split(' ')[1];
        try {
            let response = await jwt.verify(token);
            /* Añadir la propiedad «auth» al objeto global de respuesta */
            res.auth = {
                entry: true,
                data: response.data,
                status: {
                    code: response.status,
                    message: 'ENTRY'
                }
            }
            next();
        } catch (err) {
            res.auth = {
                entry: false,
                data: null,
                status: {
                    code: err.status,
                    message: err.message
                }
            }
            next();
        }
    }
}