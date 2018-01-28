"use strict";

console.log();
console.log();

// requires
const express = require('express');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Variables
const app = express();

//bodyParser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Controlamos la petición que se llama
app.use((req, res, next) => {

    console.log(`recibida petición ${req.method}: ${req.url}`);
    res.setTimeout(parseInt(5000), () => {
        res.status(408);
        console.log('Request has timed out.');
        res.send('Request has timed out.');
    });
    // Es muy importante continuar el flujo hacia la siguiente función
    next();
    // En caso de no hacerlo, se colgaría la llamada
});

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Serve Index

/*var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));*/


// Rutas

const appRoutes = require('./routes/app.js');
const usuarioRoutes = require('./routes/usuario.js')
const hospitalRoutes = require('./routes/hospital.js')
const medicoRoutes = require('./routes/medico.js')
const busquedaRoutes = require('./routes/busqueda.js')
const uploadRoutes = require('./routes/upload.js')
const imagenesRoutes = require('./routes/imagenes.js')
const loginRoutes = require('./routes/login.js')

app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/login', loginRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
// Conexión DB
mongoose.Promise = global.Promise; // ????????
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;

    console.log('MongoDB: \x1b[32m%s\x1b[0m', 'online');
    // Escuchar peticiones
    app.listen(3000, () => {
        console.log('Escuchando por el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
    });
});