var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Búsqueda POR COLECCIÓN

app.get('/coleccion/:coleccion/:busqueda', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    var coleccion = req.params.coleccion;
    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');

    var promesa;

    switch (coleccion) {
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regexp);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regexp);
            break;

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regexp);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en sintaxis de URL de búsqueda por categorías',
                errors: { message: 'Compruebe la sintaxis de la URL para la búsqueda por categorías' }
            });
    }

    promesa
        .then((respuestas) => {

            return res.status(200).json({
                ok: true,
                [coleccion]: respuestas
            });

        })

    .catch((err) => {

        return res.status(500).json({
            ok: false,
            mensaje: 'Error buscando colección ' + coleccion,
            errors: err
        });

    });


});

// Búsqueda GLOBAL

app.get('/todo/:busqueda', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regexp),
            buscarMedicos(busqueda, regexp),
            buscarUsuarios(busqueda, regexp),
        ])
        .then((respuestas) => {



            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]

            })

        }).catch((err) => {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error buscando todo',
                errors: err
            });

        });


});

// estas búsquedas pueden paginarse, etc.

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al buscar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}


function buscarMedicos(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp }, 'nombre hospital usuario img')
            .populate('usuario', 'nombre email img') // los campos nombre email de usuario
            .populate('hospital') // todos los campos de hospital
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al buscar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}


function buscarUsuarios(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al buscar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;