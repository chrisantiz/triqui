const jwt = require('./jwt');
module.exports = (req, res, next) => {
    if (!req.headers.autorization) {
        res.auth = {
            entry: false,
            data: null,
            status: {
                code: 401,
                message: 'NO_ENTRY'
            }
        }
        next();
    } else {
        const token = req.headers.autorization.split(' ')[1];
        jwt.verify(token)
            .then(data => {
                res.auth = {
                    entry: true,
                    data: data.data,
                    status: {
                        code: data.status,
                        message: 'ENTRY'
                    }
                }
                next();
            })
            .catch(err => {
                res.auth = {
                    entry: false,
                    data: null,
                    status: {
                        code: err.status,
                        message: err.message
                    }
                }
                next();
            })
    }
}