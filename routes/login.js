const express = require('express');
const app = express();
const router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const Usuario = require('./../models/usuario.js');
const usuarioRoutes = require('./usuario.js')
const SEED = require('./../config/config.js').SEED;
const GOOGLE_CLIENT_ID = require('./../config/config.js').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('./../config/config.js').GOOGLE_SECRET;

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

/*********************************************/
/*          AUTENTIFICACIÓN GOOGLE           */
/*********************************************/
router.post('/google', (req, res) => {

    var token = req.body.token || 'xxx';

    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');
    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {
            if (e) {
                return res.status(400)
                    .json({
                        ok: false,
                        err: e,
                        mensaje: 'Petición incorrecta'
                    });
            }
            var payload = login.getPayload();
            var Usuarioid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne({ email: payload.email }, (err, usuario) => {
                if (e) {
                    return res.status(500)
                        .json({
                            ok: false,
                            err: e,
                            mensaje: 'Usuario no registrado'
                        });
                }

                if (usuario) {
                    if (!usuario.google) {
                        return res.status(400)
                            .json({
                                ok: false,
                                err: e,
                                mensaje: 'DEbe de usar su autentificación normal'
                            });
                    } else {
                        var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 * 9999999999999999 });

                        res.status(200)
                            .json({
                                ok: true,
                                usuario,
                                id: usuario._id,
                                token
                            });
                    }
                } else {
                    var usuario = new Usuario({
                        nombre: payload.name,
                        email: payload.email,
                        password: ':)',
                        img: payload.picture,
                        google: true
                    })

                    usuario.save((err, usuarioDB) => {

                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al crear usuario',
                                errors: err
                            });

                        }

                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 * 9999999999999999 });

                        res.status(200)
                            .json({
                                ok: true,
                                mensaje: 'Usuario creado correctamente',
                                usuario: usuarioDB,
                                id: usuarioDB._id,
                                token
                            });
                    })
                }
            })
        });
});



/*********************************************/
/*          AUTENTIFICACIÓN NORMAL           */
/*********************************************/

router.post('/', (req, res) => {

    let body = req.body;

    let query = {
        email: body.email,
    }

    Usuario.findOne(query, (err, usuario) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al hacer Login',
                errors: err
            });

        }

        if (!usuario) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(403).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }
        //TOKEN
        usuario.password = undefined;


        var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 * 9999999999999999 });

        res.status(200)
            .json({
                ok: true,
                usuario,
                id: usuario._id,
                token
            });
    })
});

module.exports = router;