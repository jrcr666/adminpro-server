const express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

const Usuario = require('./../models/usuario.js');
const SEED = require('./../config/config.js').SEED;
const mdAutentification = require('../middlewares/autentication.js').verificaToken;

app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google') // valores que queremos que devuelva
        .skip(desde) // desde donde cuenta
        .limit(5) // hasta donde cuenta
        .exec((err, usuarios) => { // despues de los filtros llama ala fnción de búsqueda

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error',
                    errors: err
                });

            }

            Usuario.count({}, (err, count) => {
                res.status(200)
                    .json({
                        ok: true,
                        usuarios,
                        count
                    });
            })
        })
});

// ================================================
// ACTUALIZAR USUARIO
// ================================================


app.put('/:id', mdAutentification, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la llamada',
                errors: err
            });
        }

        if (!usuario) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error, no existe usuario con id: ' + id,
                errors: err
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error usuario no actualizado',
                    errors: err
                });

            }

            res.status(200)
                .json({
                    ok: true,
                    usuario: usuarioGuardado
                });
        })

    });

});

// ================================================

// ================================================

app.post('/', (req, res, next) => {

    var body = req.body;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(body.password, salt);

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        image: body.image,
        role: body.role
    })

    usuario.save((err, usuarioGuardado) => {

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
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });
    })
});


app.delete('/:id', mdAutentification, (req, res, next) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al Borrar',
                errors: err
            });

        }

        if (!usuarioEliminado) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error, no existe usuario con id: ' + id,
                errors: { message: 'Error, no existe usuario con id: ' + id, }
            });
        }

        res.status(200)
            .json({
                ok: true,
                usuario: usuarioEliminado
            });
    })
});

module.exports = app;