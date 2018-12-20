const express = require('express'),
        path = require('path'),
        morgan = require('morgan'),
        history = require('connect-history-api-fallback'),
        { PORT } = require('./server/keys'),
        publicDir = express.static(path.join(__dirname, 'public')),
        viewsDir = path.join(__dirname, 'views'),
        routes = require('./routes'),
        app = express();

app
    .use(express.json())
    .use(express.urlencoded({extended: false}))
    .set('port', process.env.PORT || PORT)
    .set('views', viewsDir)
    .use(morgan('dev'))
    /* Rutas usadas en la API */
    .use('/api', routes)
    .use(publicDir)
    .use(history())
    .use(publicDir)

module.exports = app;