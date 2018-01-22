// Requires
var express = require('express');
var mongoose = require('mongoose');





// Inicializar Variables
var app = express(); // al inicializar express creo la aplicación y se la asiggno a una variable

// Conexión a BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');


});



// Rutas
app.get('/', (req, res, next) => { // next es usado en middlewares etc, pero no en CRUD REST normalmente

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'

    })


})


// Ponemos a escuchar peticiones
app.listen(3000, () => {
    console.log('AdminApp Express Server escuchando en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');

});