const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        minlength: [2, 'Nome muito curto']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido'] // garante que o email tem um "@", um domínio e um ponto (".")
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [4, 'Senha muito curta']
    },
    isAdmin: {
        type: Boolean,
        default: false },
    colecao: [ // discos que já fazem parte da coleção do usuário
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Disco'
        }
    ],
    desejados: [ // discos que o usuário deseja comprar
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Disco'
        }
    ],
    avaliacoes: [
        {
            discoID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Disco',
                required: true
            },
            nota: {
                type: Number,
                min: 1,
                max: 5,
                required: true
            },
            comentario: {
                type: String,
                maxlength: 500
            },
            trackFavoritaID: { type: mongoose.Schema.Types.ObjectId },
            data: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: { 
        type: Date, 
        default: Date.now //caso não seja especificado, usa a hora e data atual
    }
});

usuarioSchema.pre('save', async function() {
    if(!this.isModified('senha')) return;

    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
});

usuarioSchema.methods.compararSenha = async function(senhaDigitada) {
    // pega a senha digitada e criptografa da mesma forma, caso forem iguais, deixa passar
    return await bcrypt.compare(senhaDigitada, this.senha);
};


module.exports = mongoose.model('Usuario', usuarioSchema);