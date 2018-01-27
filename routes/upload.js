var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();

var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// default options MIDDLEWARE
app.use(fileUpload());

app.put('/:tipo/:id', function(req, res) {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Sólo se aceptan los siguientes tipos:
    tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'El tipo de colección ' + tipo + ' no es válido',
            errors: { message: 'Especifique una colección válida: hospitales, usuarios o medicos' }
        });

    }



    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha especificado ningún archivo para cargar',
            errors: { message: 'Especifique la imagen a cargar' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var archivoCortado = archivo.name.split('.');
    var extensionArchivo = archivoCortado[archivoCortado.length - 1];

    // Sólo se aceptan las siguientes excepciones:
    extensionesValidas = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'tiff'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'La extensión ' + extensionArchivo + ' no es válida para una imagen',
            errors: { message: 'Especifique una imagen a cargar con extensión .png, .jpg, .jpeg, .gif, .bmp o .tiff' }
        });

    }

    // nombre de archivo personalizado
    // ID USUARIO - NOMBRE RANDOMIZADO (PARA PREVENIR LA CACHÉ DEL NAVEGADOR WEB) + '.' + EXTENSION - ASÍ TENDREMOS SIEMPRE UN NOMBRE ÚNICO
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // crear el path en el servidor para guardar la imagen
    var path = `./uploads/${ tipo }/${ nombreArchivo}`;


    // Mover el archivo del temporal a un path
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar la imagen',
                errors: { message: err }
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuarioDB) => {

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con id ' + id + ' no existe',
                    errors: { message: 'Especifique un id de usuario válido' }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar el usuario con id ' + id,
                    errors: { message: err }
                });
            }

            // Borramos la imagen anterior si existía de la colección correspondiente (cada usuario/medico/hospital tiene sólo 1 imagen)
            var pathViejo = './uploads/usuarios/' + usuarioDB.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuarioDB.img = nombreArchivo;
            usuarioDB.save((err, usuarioDBActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'La imagen del usuario con id ' + id + ' no ha podido ser actualizada',
                        errors: { message: err }
                    });
                }

                usuarioDBActualizado.password = null;

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada correctamente',
                    usuario: usuarioDBActualizado

                });


            });


        });

    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medicoDB) => {

            if (!medicoDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con id ' + id + ' no existe',
                    errors: { message: 'Especifique un id de médico válido' }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar el médico con id ' + id,
                    errors: { message: err }
                });
            }

            // Borramos la imagen anterior si existía de la colección correspondiente (cada usuario/medico/hospital tiene sólo 1 imagen)
            var pathViejo = './uploads/medicos/' + medicoDB.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }


            medicoDB.img = nombreArchivo;
            medicoDB.save((err, medicoDBActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'La imagen del médico con id ' + id + ' no ha podido ser actualizada',
                        errors: { message: err }
                    });
                }

                medicoDBActualizado.password = null;

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada correctamente',
                    medico: medicoDBActualizado

                });


            });




        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospitalDB) => {

            if (!hospitalDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con id ' + id + ' no existe',
                    errors: { message: 'Especifique un id de hospital válido' }
                });
            }

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al recuperar el hospital con id ' + id,
                    errors: { message: err }
                });
            }

            // Borramos la imagen anterior si existía de la colección correspondiente (cada usuario/medico/hospital tiene sólo 1 imagen)
            var pathViejo = './uploads/hospitales/' + hospitalDB.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }


            hospitalDB.img = nombreArchivo;
            hospitalDB.save((err, hospitalDBActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'La imagen del hospital con id ' + id + ' no ha podido ser actualizada',
                        errors: { message: err }
                    });
                }

                hospitalDBActualizado.password = null;

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada correctamente',
                    hospital: hospitalDBActualizado

                });


            });


        });
    }
}


module.exports = app;