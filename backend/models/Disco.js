// chamar o mongoose
const mongoose = require('mongoose');

const discoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true
    },
    artista: {
        type: String,
        required: [true, 'Artista é obrigatório'],
        trim: true
    },
    ano: {
        type: Number,
        required: [true, 'Ano é obrigatório'],
        min: [1900, 'Ano muito antigo'],
        max: [new Date().getFullYear(), 'Ano não pode ser futúro']
    },
    genero: [String],
    gravadora: {
        type: String,
        trim: true
    },
    pais: {
        type: String,
        trim: true
    },
    precoEstimado: {
        type: Number,
        min: 0
    },
    capaUrl: {
        type: String,
        trim: true,
        default: 'https://via.placeholder.com/300x300?text=Sem+Capa'
    },
    faixas: [
        {
            nome: { type: String, required: true },
            duracao: { type: String } // minutagem -> MM:SS
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Índice de busca rápida por artista e título
discoSchema.index({ artista: 1, titulo: 1 });

module.exports = mongoose.model('Disco', discoSchema);