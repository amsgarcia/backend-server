var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../config/config');

var app = express();

var Usuario = require('../models/usuario');

const GoogleAuth = require('google-auth-library');


// =================================
// RENOVAR TOKEN
// =================================

var mdAutenticacion = require('../middlewares/autenticacion');

app.get('/newtoken', mdAutenticacion.verificaToken, (req, res) => {

    // Crear un JWT (Token)
    var token = jwt.sign({ usuario: req.usuario }, // payload
        config.SEED, // seed aleatorio que queramos poner difícil de adivinar.
        { expiresIn: config.TOKEN_EXPIRES_IN } // segundos 
    )

    return res.status(200).json({
        ok: true,
        token: token
    });

});


// =================================
// AUTENTICACION GOOGLE
// =================================
app.post('/google', (req, res) => {

    var token = req.body.token || 'xxx';

    var client = new GoogleAuth.OAuth2Client(
        config.GOOGLE_CLIENT_ID,
        config.GOOGLE_CLIENT_SECRET,
        ''
    );

    client.verifyIdToken({ idToken: token, audience: config.GOOGLE_CLIENT_ID },
        (err, login) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Token Incorrecto',
                    errors: { message: err }
                });
            }

            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne({ email: payload.email }, (err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en login de usuario - google',
                        errors: { message: err }
                    });
                }

                if (usuarioDB) {
                    if (!usuarioDB.google) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Utilice el método de autenticación normal',
                            errors: { message: 'Usuario no Google' }
                        });
                    } else {

                        // ponmemos contraseña a null antes de generar el token 
                        usuarioDB.password = '';

                        // Crear un JWT (Token)
                        var token = jwt.sign({ usuario: usuarioDB }, // payload
                            config.SEED, // seed aleatorio que queramos poner difícil de adivinar.
                            { expiresIn: config.TOKEN_EXPIRES_IN } // segundos 
                        )

                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Login Google OK',
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB.id,
                            menu: obtenerMenu(usuarioDB.role)
                        });

                    }

                    // Usuario no existe por correo, creamos nuevo usuario autenticado por Google
                } else {

                    var usuario = new Usuario();

                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture; // en el frontend si el usuario es de google con un pipe usaremos esta URL,y si el usuario es normal usaremos la que tenga cargada en el servidor ese usuario
                    usuario.google = true;

                    usuario.save((err, usuarioCreado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al crear usuario - Google',
                                errors: { message: err }
                            });
                        }

                        // Crear un JWT (Token)
                        var token = jwt.sign({ usuario: usuarioCreado }, // payload
                            config.SEED, // seed aleatorio que queramos poner difícil de adivinar.
                            { expiresIn: config.TOKEN_EXPIRES_IN } // segundos 
                        );

                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Login Google OK',
                            usuario: usuarioCreado,
                            token: token,
                            id: usuarioCreado.id,
                            menu: obtenerMenu(usuario.role)

                        });

                    });
                }
            });


        });


});


// =================================
// AUTENTICACION NORMAL
// =================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en login de usuario',
                errors: { message: err }
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
        usuarioDB.password = '';

        // Crear un JWT (Token)
        var token = jwt.sign({ usuario: usuarioDB }, // payload
            config.SEED, // seed aleatorio que queramos poner difícil de adivinar.
            { expiresIn: config.TOKEN_EXPIRES_IN } // segundos 
        )



        return res.status(200).json({
            ok: true,
            mensaje: 'Login OK',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id,
            menu: obtenerMenu(usuarioDB.role)

        });

    })




});


function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Panel de Control', url: '/dashboard' },
                { titulo: 'Barra de Progreso', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' },

            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // {titulo: 'Usuarios', url: '/usuarios'},
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;