const express = require('express');
const app = express();
const router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const User = require('./../models/usuario.js');
const usuarioRoutes = require('./usuario.js')
const SEED = require('./../config/config.js').SEED;


router.post('/', (req, res) => {

    let body = req.body;

    let query = {
        email: body.email,
    }

    User.findOne(query, (err, usuario) => {

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