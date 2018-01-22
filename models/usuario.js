var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');


var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['USER_ROLE', 'ADMIN_ROLE'],
    message: '{VALUE} no es un rol permitido'
};


var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre de usuario es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo del usuario es necesario', ] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} ya existe' });

module.exports = mongoose.model('Usuario', usuarioSchema); // exporta para usarlo desde fuera el modelo de este objeto con el nombre de modelo 'Usuario'