// imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

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

// config da sessão redis
app.use(session({
    store: new RedisStore({ client: redisClient }), // onde tudo será guardado
    secret: process.env.SESSION_SECRET || 'fallback-secreto-demais-teste',
    resave: false, // não salva nada se não tiver alteração
    saveUninitialized: false, // não cria sessão anônima
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas de duração máxima
        httpOnly: true // só HTTP por segurança
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