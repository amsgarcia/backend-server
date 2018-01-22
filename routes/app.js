var express = require('express');

var app = express();


app.get('/', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'

    })


});

module.exports = app;