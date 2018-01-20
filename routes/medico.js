const express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

const Medico = require('./../models/medico.js');
const SEED = require('./../config/config.js').SEED;
const mdAutentification = require('../middlewares/autentication.js').verificaToken;

app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde) // desde donde cuenta
        .limit(5) // hasta donde cuenta
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error',
                    errors: err
                });

            }
            Medico.count({}, (err, count) => {
                res.status(200)
                    .json({
                        ok: true,
                        medicos,
                        count
                    });
            });
        })
});

// ================================================
// ACTUALIZAR MEDICO
// ================================================


app.put('/:id', mdAutentification, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la llamada',
                errors: err
            });
        }

        if (!medico) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error, no existe medico con id: ' + id,
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error medico no actualizado',
                    errors: err
                });

            }

            res.status(200)
                .json({
                    ok: true,
                    medico: medicoGuardado
                });
        })

    });

});

// ================================================

// ================================================

app.post('/', mdAutentification, (req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    })

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error',
                errors: err
            });

        }

        res.status(201)
            .json({
                ok: true,
                medico: medicoGuardado,
                medicoToken: req.medico
            });
    })
});


app.delete('/:id', mdAutentification, (req, res, next) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al Borrar',
                errors: err
            });

        }

        if (!medicoEliminado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error, no existe medico con id: ' + id,
                errors: { message: 'Error, no existe medico con id: ' + id, }
            });
        }

        res.status(200)
            .json({
                ok: true,
                medico: medicoEliminado
            });
    })
});

module.exports = app;