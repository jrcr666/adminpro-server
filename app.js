"use strict";

// requires
console.log('clear');
console.log();
console.log();
const express = require('express');
var mongoose = require('mongoose');

// Variables
const app = express();
const router = express.Router();

// Conexión DB

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('MongoDB: \x1b[32m%s\x1b[0m', 'online');
    // Escuchar peticiones
    app.listen(3000, () => {
        console.log('Escuchando por el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
    });
});
// Rutas

app.use('/', router);
router.get('/', (req, res, next) => {

        res.status(200)
            .json({
                ok: true,
                mensaje: 'Petición realizada correctamente'
            });
    })
    .get('/user', (req, res, next) => {

        res.status(200)
            .json('Hola User!');
    })