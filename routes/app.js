const express = require('express');
const app = express();
const router = express.Router();


router.get('/', (req, res, next) => {

    res.status(200)
        .json({
            ok: true,
            mensaje: 'Petición realizada correctamente'
        });
});

module.exports = router;