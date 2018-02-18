var express = require('express');
var config = require('../config/config');
var jwt = require('jsonwebtoken');

app = express();



// =============================
// VERIFICAR TOKEN (MIDDLEWARE)
// =============================
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, config.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();



    });
}

// =============================
// VERIFICAR SI ES UN ADMININSTRADOR (MIDDLEWARE)
// =============================
exports.verificaAdmin = function(req, res, next) {

    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Rol inválido',
            errors: { message: 'No es administrador' }
        });
    }


}

// =============================
// VERIFICAR SI ES UN ADMININSTRADOR O EL MISMO USUARIO (MIDDLEWARE)
// =============================
exports.verificaAdminOMismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Rol o usuario inválido',
            errors: { message: 'No es administrador ni el mismo usuario' }
        });
    }


}