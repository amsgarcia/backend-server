var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// =============================
// OBTENER TODOS LOS HOSPITALES
// =============================

app.get('/', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre usuario img')
        .skip(desde) // se salta los primeros....desde ¡ya está paginado!
        .limit(5) //limita el resultado a los cinco primeros registros.
        .populate('usuario', 'nombre email') // Devuelve el objeto usuario en vez de su id. 2do argumento filtra los campos que queremos devolver
        .exec((err, hospitales) => {

            if (err) {

                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });

            }

            Hospital.count({}, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: total
                });
            });
        });

});


// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findById(id, 'nombre usuario img')
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
})


// =============================
// ACTUALIZAR HOSPITAL
// =============================

app.put('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;
    var body = req.body; // funciona porque tenemos el body parser, si no saldría undefined


    Hospital.findById(id, (err, hospital) => {

        if (err) {

            // No funciona
            var status = err.status ? err.status : 500;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al actualizar hsopital',
                errors: err
            });

        }

        if (!hospital) return res.status(400).json({
            ok: false,
            mensaje: 'El hospital no existe',
            errors: { message: 'No existe un hospital con el id ' + id }
        });

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                mensaje: 'Hospital actualizado',
                hospital: hospitalGuardado

            });

        });

    });

});


// =============================
// CREAR UN NUEVO HOSPITAL
// =============================

app.post('/', [mdAutenticacion.verificaToken], (req, res) => {

    var body = req.body; // funciona porque tenemos el body parser, si no saldría undefined

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {

            // No funciona
            var status = err.status ? err.status : 400;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });

        }

        return res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });


});

// =============================
// BORRAR HOSPITAL POR ID
// =============================

app.delete('/:id', [mdAutenticacion.verificaToken], (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {

            // No funciona
            var status = err.status ? err.status : 500;
            console.log(err.status);

            return res.status(status).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });

        }

        if (!hospitalBorrado) {


            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital inexistente',
                errors: err
            });

        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });


    });

});


module.exports = app;