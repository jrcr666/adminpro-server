const express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

const Hospital = require('./../models/hospital.js');
const SEED = require('./../config/config.js').SEED;
const mdAutentification = require('../middlewares/autentication.js').verificaToken;

app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital
        .find({})
        .skip(desde) // desde donde cuenta
        .limit(5) // hasta donde cuenta
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error',
                    errors: err
                });

            }

            Hospital.count({}, (err, count) => {
                res.status(200)
                    .json({
                        ok: true,
                        hospitales,
                        count
                    });
            });
        });
});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
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
                    errors: { message: 'No existe un hospitalcon ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
})

// ================================================
// ACTUALIZAR HOSPITAL
// ================================================


app.put('/:id', mdAutentification, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la llamada',
                errors: err
            });
        }

        if (!hospital) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error, no existe hospital con id: ' + id,
                errors: err
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = body.usuario;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error hospital no actualizado',
                    errors: err
                });

            }

            res.status(200)
                .json({
                    ok: true,
                    hospital: hospitalGuardado
                });
        });

    });

})

// ================================================

// ================================================

app.post('/', mdAutentification, (req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
    })

    hospital.save((err, hospitalGuardado) => {

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
                hospital: hospitalGuardado,
                hospitalToken: req.hospital
            });
    })
});


app.delete('/:id', mdAutentification, (req, res, next) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al Borrar',
                errors: err
            });

        }

        if (!hospitalEliminado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error, no existe hospital con id: ' + id,
                errors: { message: 'Error, no existe hospital con id: ' + id, }
            });
        }

        res.status(200)
            .json({
                ok: true,
                hospital: hospitalEliminado
            });
    })
});

module.exports = app;