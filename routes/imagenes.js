const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');

var Hospital = require('./../models/hospital.js');
var Medico = require('./../models/medico.js');
var Usuario = require('./../models/usuario.js');

var fs = require('fs');


app.get('/:tipo/:img', function(req, res) {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var path = `./uploads/${tipo}/`;

    var tiposDeColecciones = ['usuarios', 'medicos', 'hospitales'];

    if (!tiposDeColecciones.includes(tipo)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Colección no válida',
            errors: {
                message: 'Las extensiones válidas son: ' + tiposDeColecciones.join(', ')
            }
        });
    }
    console.log(`${path}${img}`);
    fs.exists(`${path}${img}`, existe => {
        if (!existe) {
            console.log('existe', existe)
            path = './assets/';
            img = 'no-img.jpg';


        }
    res.sendFile(`${img}`,{ root :  path});
    });
});


module.exports = app;