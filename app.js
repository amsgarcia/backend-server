// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar Variables
var app = express(); // al inicializar express creo la aplicación y se la asiggno a una variable


// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())



// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// Conexión a BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');


});



// Rutas
// Creamos un middleware que se genera antes que las rutas
app.use('/usuario', usuarioRoutes); // es importante el ORDEN de las rutas de más específico a menos para evitar rutas muertas (best match)
app.use('/login', loginRoutes); // es importante el ORDEN de las rutas de más específico a menos para evitar rutas muertas (best match)
app.use('/', appRoutes);


// Ponemos a escuchar peticiones
app.listen(3000, () => {
    console.log('AdminApp Express Server escuchando en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');

});