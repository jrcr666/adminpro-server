const express = require('express');
const app = express();
const router = express.Router();

var Hospital = require('./../models/hospital.js');
var Medico = require('./../models/medico.js');
var Usuario = require('./../models/usuario.js');


router.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        default:
            res.status(500)
                .json({
                    ok: false,
                    mensaje: 'La colección no existe'
                });
            break;

    }

    promesa.then(data => {
            res.status(200)
                .json({
                    ok: true,
                    [tabla]: data
                });
        })

        .catch((err) => {
            res.status(500)
                .json({
                    ok: false,
                    mensaje: 'La petición no se realizó correctamente',
                    err
                });
        })
});


/**************************************************/


router.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex),
        ])
        .then(respuestas => {
            res.status(200)
                .json({
                    ok: true,
                    hospitales: respuestas[0],
                    medicos: respuestas[1],
                    usuarios: respuestas[2]
                });
        })

        .catch((err) => {
            res.status(500)
                .json({
                    ok: false,
                    mensaje: 'La petición no se realizó correctamente',
                    err
                });
        })
});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar los hospitales', err);
                } else {

                    resolve(hospitales);
                }
            })
    })
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar los médicos', err);
                } else {

                    resolve(medicos);
                }
            })
    })
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email img role')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar los usuarios', err);
                } else {

                    resolve(usuarios);
                }
            })
    })
}

module.exports = router;