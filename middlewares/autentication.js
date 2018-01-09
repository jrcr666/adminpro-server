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