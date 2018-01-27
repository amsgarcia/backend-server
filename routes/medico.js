var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// =============================
// OBTENER TODOS LOS MEDICOS
// =============================

app.get('/', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre hospital')
        .skip(desde) // se salta los primeros....desde ¡ya está paginado!
        .limit(5) //limita el resultado a los cinco primeros registros.
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {

                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médico',
                    errors: err
                });

            }

            Medico.count({}, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando médico',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: total
                });
            });

        });
});


// =============================
// ACTUALIZAR MEDICO
// =============================

app.put('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body; // funciona porque tenemos el body parser, si no saldría undefined


    Medico.findById(id, (err, medico) => {

        if (err) {

            // No funciona
            var status = err.status ? err.status : 500;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al actualizar médico',
                errors: err
            });

        }

        if (!medico) return res.status(400).json({
            ok: false,
            mensaje: 'El médico no existe',
            errors: { message: 'No existe un médico con el id ' + id }
        });

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: 'Médico actualizado',
                hospital: medicoGuardado

            });

        });

    });

});


// =============================
// CREAR UN NUEVO MÉDICO
// =============================

app.post('/', [mdAutenticacion.verificaToken], (req, res) => {

    var body = req.body; // funciona porque tenemos el body parser, si no saldría undefined

    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoGuardado) => {
        if (err) {

            // No funciona
            var status = err.status ? err.status : 400;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });

        }

        return res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });


});

// =============================
// BORRAR MEDICO POR ID
// =============================

app.delete('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {

            // No funciona
            var status = err.status ? err.status : 500;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });

        }

        if (!medicoBorrado) {


            return res.status(400).json({
                ok: false,
                mensaje: 'Médico inexistente',
                errors: err
            });

        }

        return res.status(200).json({
            ok: true,
            hospital: medicoBorrado
        });


    });

});


module.exports = app;