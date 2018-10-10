const express = require('express'),
        path = require('path'),
        morgan = require('morgan'),
        history = require('connect-history-api-fallback'),
        port = process.env.PORT || 3000,
        publicDir = express.static(path.join(__dirname, 'public')),
        viewsDir = path.join(__dirname, 'views'),
        routes = require('./routes'),
        app = express();
        
app
    .use(express.json())
    .use(express.urlencoded({extended: false}))
    .set('port', port)
    .set('views', viewsDir)
    .use(morgan('dev'))
    .use(publicDir)
    .use(history())
    .use(publicDir)
    .use('/api', routes)

module.exports = app;