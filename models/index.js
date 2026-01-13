const sequelize = require('../../connection');
const User = require('./userModel');
const Alojamento = require('./alojamentoModel');
const Evento = require('./eventoModel');
const Reserva = require('./reservaModel');
const Inscricao = require('./inscricaoModel');
const Avaliacao = require('./avaliacaoModel');

// Definir as relações entre os modelos
User.hasMany(Alojamento, { 
    foreignKey: 'proprietario_id',
    as: 'alojamentos'
});
User.hasMany(Evento, { 
    foreignKey: 'organizador_id',
    as: 'eventos'
});
User.hasMany(Reserva, { 
    foreignKey: 'user_id',
    as: 'reservas'
});
User.hasMany(Inscricao, { 
    foreignKey: 'user_id',
    as: 'inscricoes'
});
User.hasMany(Avaliacao, {
    foreignKey: 'user_id',
    as: 'avaliacoes'
});

Alojamento.belongsTo(User, { 
    foreignKey: 'proprietario_id',
    as: 'proprietario'
});
Alojamento.hasMany(Reserva, { 
    foreignKey: 'alojamento_id',
    as: 'reservas'
});
Alojamento.hasMany(Avaliacao, {
    foreignKey: 'alojamento_id',
    as: 'avaliacoes'
});

Evento.belongsTo(User, { 
    foreignKey: 'organizador_id',
    as: 'organizador'
});
Evento.hasMany(Inscricao, { 
    foreignKey: 'evento_id',
    as: 'inscricoes'
});
Evento.hasMany(Avaliacao, {
    foreignKey: 'evento_id',
    as: 'avaliacoes'
});

Reserva.belongsTo(User, { 
    foreignKey: 'user_id',
    as: 'user'
});
Reserva.belongsTo(Alojamento, { 
    foreignKey: 'alojamento_id',
    as: 'alojamento'
});

Inscricao.belongsTo(User, { 
    foreignKey: 'user_id',
    as: 'user'
});
Inscricao.belongsTo(Evento, { 
    foreignKey: 'evento_id',
    as: 'evento'
});

Avaliacao.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});
Avaliacao.belongsTo(Alojamento, {
    foreignKey: 'alojamento_id',
    as: 'alojamento'
});
Avaliacao.belongsTo(Evento, {
    foreignKey: 'evento_id',
    as: 'evento'
});

module.exports = {
    sequelize,
    User,
    Alojamento,
    Evento,
    Reserva,
    Inscricao,
    Avaliacao
}; 