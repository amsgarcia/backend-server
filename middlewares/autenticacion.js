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
                mensaje: 'Token inváliddo',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();



    });
}