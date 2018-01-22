var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../config/config');

var app = express();

var Usuario = require('../models/usuario');


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en login de usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        // ponmemos contraseña a null antes de generar el token 
        usuarioDB.password = null;

        // Crear un JWT (Token)
        var token = jwt.sign({ usuario: usuarioDB }, // payload
            config.SEED, // seed aleatorio que queramos poner difícil de adivinar.
            { expiresIn: 14400 } // segundos = 4 horas
        )



        return res.status(200).json({
            ok: true,
            mensaje: 'Login OK',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });

    })




});













module.exports = app;