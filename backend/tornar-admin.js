require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

async function tornarAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado');

        const resultado = await Usuario.updateOne(
            { email: 'augusto-teste@email.com' },
            { $set: { isAdmin: true } }
        );

        if (resultado.modifiedCount > 0) {
            console.log('✅ Usuário agora é ADMIN!');
        } else {
            console.log('⚠️ Usuário não encontrado ou já possúi permissão de admin');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

tornarAdmin();