var express = require('express');
var fs = require('fs');

var app = express();


// TODO: EXIGIR TOKEN
app.get('/:tipo/:img', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    var tipo = req.params.tipo;
    var img = req.params.img;

    var path = `./uploads/${tipo}/${img}`;

    fs.exists(path, existe => {

        if (!existe) {

            path = './assets/no-img.jpg';

        }

        res.sendfile(path);

    });





});

module.exports = app;