var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// =============================
// OBTENER TODOS LOS USUARIOS
// =============================

app.get('/', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde) // se salta los primeros....desde ¡ya está paginado!
        .limit(5) //limita el resultado a los cinco primeros registros.
        .exec((err, usuarios) => {

            if (err) {

                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });

            }

            Usuario.count({}, (err, total) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando usuario',
                            errors: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: total
                    });
                }

            );

        });

});


// =============================
// ACTUALIZAR USUARIO
// =============================

app.put('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body; // funciona porque tenemos el body parser, si no saldría undefined


    Usuario.findById(id, (err, usuario) => {

        if (err) {

            // No funciona
            var status = err.status ? err.status : 500;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: err
            });

        }

        if (!usuario) return res.status(400).json({
            ok: false,
            mensaje: 'El usuario no existe',
            errors: { message: 'No existe un usario con el id ' + id }
        });

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            if (usuarioGuardado) usuarioGuardado.password = null;

            return res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado',
                usuario: usuarioGuardado

            });

        });

    });

});


// =============================
// CREAR UN NUEVO USUARIO - QUITAMOS TOKEN DE MOMENTO
// =============================

// app.post('/', [mdAutenticacion.verificaToken], (req, res) => {
app.post('/', (req, res) => {

    var body = req.body; // funciona porque tenemos el body parser, si no saldría undefined

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {

            // No funciona
            var status = err.status ? err.status : 400;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });

        }

        if (usuarioGuardado) usuarioGuardado.password = null;

        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });


});

// =============================
// BORRAR USUARIO POR ID
// =============================

app.delete('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {

            // No funciona
            var status = err.status ? err.status : 500;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });

        }

        if (!usuarioBorrado) {


            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario inexistente',
                errors: err
            });

        }

        usuarioBorrado.password = null;

        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });


    });

});


module.exports = app;