process.on('uncaughtException', (err) => {
    console.error('ERRO COMPLETO:', err);
});

// imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');

// import do redis
const redisClient = require('./config/redis');

// route imports
const discoRoutes = require('./routes/discoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];

//cors
app.use(cors({
    origin: function(origin, callback) {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS não permitido'), false)
        }
        return callback(null, true)
    },
    credentials: true
})); // libera acesso para o front
app.use(express.json()); // permite receber json nas requisições

// config de sessão
app.use(session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

//conexão mongodb
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado!'))
    .catch(err => console.error('❌ Erro no MongoDB:', err));

//rotas
app.use ('/api/discos', discoRoutes);
app.use ('/api/usuarios', usuarioRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', mensagem: 'Servidor rodando!' });
});

// Rodar o server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});