const mongoose = require('mongoose');
const redisClient = require('../config/redis');
const Disco = require('../models/Disco');
const Usuario = require('../models/Usuario');

// Listar todos os discos
const listarDiscos= async (req, res) => {
    try {
        // find para mostrar todos e sort para organizar
        const discos = await Disco.find().sort({ createdAt: -1});
        
        res.json(discos);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        res.status(500).json({ erro: error.message });
    }
};

// Buscar disco por ID
const buscaDiscoID = async (req, res) => {
    try {
        const { id } = req.params;


        let views = await redisClient.incr(`discos:${id}:views`);

        await redisClient.zAdd('ranking:discos', [
            {
                score: Number(views),
                value: id.toString()
            }
        ]);

        const disco = await Disco.findById(id);

        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado' });
        }

        res.json({
            ...disco.toObject(),
            visualizacaoEmTempoReal: Number(views)
        });

    } catch (error){
        res.status(500).json({ erro: error.message });
    }
};

// Criar novo disco
const criarDisco = async (req, res) => {
    try {

        if (!req.session.usuarioID) {
            return res.status(401).json({ erro: 'Não logado' });
        }

        const usuario = await Usuario.findById(req.session.usuarioID);

        if(!usuario || !usuario.isAdmin) {
            return res.status(403).json({ erro: 'Somente admin'})
        }

        const disco = new Disco(req.body);

        await disco.save();

        await redisClient.zAdd('ranking:discos', [
            {
                score: 0,
                value: disco._id.toString()
            }
        ]
        );

        await redisClient.del('discos:lista');
        res.status(201).json(disco);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
};

// Atualizar um disco existente
const atualizarDisco = async (req, res) => {
    try {
        const disco = await Disco.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        await redisClient.del('discos:lista');
        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado' });
        }
        res.json(disco);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
};

// Deletar disco
const deletarDisco = async (req, res) => {
    try {

        console.log('SESSION:', req.session);
        console.log('USER ID:', req.session.usuarioID);
        
        const usuario = await Usuario.findById(req.session.usuarioID);

        // verifica se o usuário existe e se tem permissão de admin
        if(!usuario || !usuario.isAdmin) {
            // se não for admin, retorna erro 403 (forbidden)
            return res.status(403).json({
                erro: 'Você precisa ser um administrador para deletar discos'
            });
        }

        // deleta o disco do mongodb
        const disco = await Disco.findByIdAndDelete(req.params.id);

        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado' });
        }

        await Usuario.updateMany(
            {},
            {
                $pull: {
                    colecao: req.params.id,
                    desejados: req.params.id,
                    avaliacoes: { discoID: req.params.id }
                }
            }
        );

        await redisClient.del('discos:lista');
        await redisClient.zRem('ranking:discos', req.params.id.toString());
        await redisClient.del(`discos:${req.params.id}:views`);

        res.json({ mensagem: 'Disco deletado com sucesso' });
        
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

const rankingDiscos = async (req, res) => {
    try {

        // pega ids do ranking no Redis
        const rankingIDs = await redisClient.zRange(
            'ranking:discos',
            0,
            9,
            {
                REV: true
            }
        );

        let discos = [];

        // se existir ranking
        if (rankingIDs.length > 0) {

            const discosMongo = await Disco.find({
                _id: { $in: rankingIDs }
            });

            // mantém ordem do Redis
            discos = rankingIDs
                .map(id =>
                    discosMongo.find(
                        d => d._id.toString() === id
                    )
                )
                .filter(Boolean);
        }

        // completa com discos recentes se tiver menos de 10
        if (discos.length < 10) {

            const idsExistentes = discos.map(
                d => d._id.toString()
            );

            const extras = await Disco.find({
                _id: { $nin: idsExistentes }
            })
            .sort({ createdAt: -1 })
            .limit(10 - discos.length);

            discos = [...discos, ...extras];
        }

        res.json(discos);

    } catch (error) {

        console.error('ERRO RANKING:', error);

        res.status(500).json({
            erro: error.message
        });
    }
};



module.exports = {
    listarDiscos,
    buscaDiscoID,
    criarDisco,
    atualizarDisco,
    deletarDisco,
    rankingDiscos
};