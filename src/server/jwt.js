const jwt = require('jsonwebtoken');
const timer = require('./config').timer;
const fs = require('fs');
/* Llaves */
const privateKey = fs.readFileSync(`${__dirname}/keys/private.key`);
const publicKey = fs.readFileSync(`${__dirname}/keys/public.key`);

module.exports = {
    /* Crea un nuevo token */
    create (data, unit = null, amount = null) {
        const payload = {
            data,
            iat: Date.now(),
        }
        /* Cuando se quiere crear un token que expire en un tiempo determinado */
        if (unit && amount) {
            payload['exp'] =  Date.now() + timer[unit] * amount;
        }
        return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    },
    /* Verifica un token */
    verify(token) {
        return new Promise((resolve, reject) => {
            try {
                const decoded = jwt.verify(token, publicKey, { algorithm: 'RS256' });

                if(decoded.exp <= Date.now()) {
                    /* Cuando el token ha expirado */
                    reject({
                        status: 401,
                        message: 'EXPIRED_TOKEN'
                    });
                };
                /* Retorna el token creado */
                resolve({
                    status: 200,
                    data: decoded.data
                })
            } catch (err) {
                /* Cuando el token verificado es inválido */
                reject({
                    status: 401,
                    message: 'INVALID_TOKEN'
                });
            }
        });
    }
};