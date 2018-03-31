const express = require('express');
var jwt = require('jsonwebtoken');

var app = express();

const SEED = require('./../config/config.js').SEED;
// ================================================
// VERIFICAR TOKEN
// ================================================

exports.verificaToken = (req, res, next) => {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la identificación',
                errors: err
            });
        }

        if (!decoded) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.usuario = decoded.usuario

        next();
        /* res.status(200).json({
             ok: true,
             decoded
         });*/
    });
}

exports.verificaADMIN_ROLE_o_MISMO = (req, res, next) => {
    var id = req.params.id;
    var usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'Opcon no disponible' }
        });
    }
}