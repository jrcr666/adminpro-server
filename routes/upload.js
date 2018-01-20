const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');

var Hospital = require('./../models/hospital.js');
var Medico = require('./../models/medico.js');
var Usuario = require('./../models/usuario.js');

var fs = require('fs');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', function(req, res) {

    var tipo = req.params.tipo;
    var id = req.params.id;

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

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No hay ningún archivo para subir',
            errors: { message: 'Debe seleccionar un archivo de imagen' }
        });
    }

    // OBtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreArchivo = archivo.name.split('.');
    var extensionArchivo = nombreArchivo[nombreArchivo.length - 1];

    nombreArchivo.pop();
    nombreArchivo = nombreArchivo.join('.');

    // extensiones permitidas 

    var extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (!extensionesPermitidas.includes(extensionArchivo)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {
                message: 'Las extensiones válidas son: ' + extensionesPermitidas.join(', ')
            },
            nombreArchivo,
            extensionArchivo
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivoNuevo = `${id}-${Date.now()}.${extensionArchivo}`;

    //Mover archivo de el path temporar a una dirección final
    var path = `./uploads/${tipo}/${nombreArchivoNuevo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Hubo un error al subir el archivo',
                errors: err,
                nombreArchivo,
                extensionArchivo,
                path
            });
        }
        subirPorTipo(tipo, id, nombreArchivoNuevo, res);
        /*res.status(200)
            .json({
                ok: true,
                mensaje: '¡Archivo subido correctamente!',
                nombreArchivoNuevo
            });*/
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    switch (tipo) {

        case 'usuarios':

            Usuario.findById(id, (err, usuario) => {

                var pathViejo = './uploads/usuarios/' + usuario.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {

                    if (err) {
                        return res.send(err);
                    }
                    res.status(200)
                        .json({
                            ok: true,
                            mensaje: 'Imagen de usuario actualizada',
                            usuarioActualizado
                        });
                })
            })
            return;
            break;
        case 'hospitales':

            Hospital.findById(id, (err, hospital) => {

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {

                    if (err) {
                        return res.send(err);
                    }
                    res.status(200)
                        .json({
                            ok: true,
                            mensaje: 'Imagen de hospital actualizada',
                            hospitalActualizado
                        });
                })
            })
            return;
            break;
        case 'medicos':

            Medico.findById(id, (err, medico) => {

                var pathViejo = './uploads/medicos/' + medico.img;

                // si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {

                    if (err) {
                        return res.send(err);
                    }
                    res.status(200)
                        .json({
                            ok: true,
                            mensaje: 'Imagen de medico actualizada',
                            medicoActualizado
                        });
                })
            })
            return;
            break;
    }
}

module.exports = app;