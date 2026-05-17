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

        // incremento
        const views = await redisClient.incr(`disco:${id}:views`)

        //zadd adiciona ou atualiza um item no ranking ordenado
        await redisClient.zadd('ranking:discos', views, id.toString());

        //pede o parametro do id pra buscar
        const disco = await Disco.findById(id);
        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado'});
        }

        //Retorna o disco + o contador de views
        res.json({
            ...disco.toObject(),
            visualizacaoEmTempoReal: views
        });
    
    } catch (error){
        res.status(500).json({ erro: error.message });
    }
};

// Criar novo disco
const criarDisco = async (req, res) => {
    try {
        const disco = new Disco(req.body);
        await disco.save();
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
        await redisClient.zrem('ranking:discos', req.params.id);
        await redisClient.del(`disco:${req.params.id}:views`);

        res.json({ mensagem: 'Disco deletado com sucesso' });
        
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// Top 10 mais vistos
const rankingDiscos = async (req, res) => {
    try {
        // busca os top 10 ids e poe os nomes na lista
        const rankingIDs = await redisClient.zrevrange(
            'ranking:discos',
            0,
            9,
            'WITHSCORES'
        );

        // Se não tiver nenhum no ranking
        if (rankingIDs.length === 0) {
            return res.json({ mensagem: 'Nenhuma visualização ainda'})
        }
///////////////////////////////////////////////////////////////////////
const ids = [];
const scoresMap = {};

for (let i = 0; i < rankingIDs.length; i += 2) {
    const id = rankingIDs[i];
    const score = parseInt(rankingIDs[i + 1]);

    if (mongoose.Types.ObjectId.isValid(id)) {
        ids.push(id);
        scoresMap[id] = score;
    }
}

const discos = await Disco.find({ _id: { $in: ids } });

const discosMap = {};

discos.forEach(d => {
    discosMap[d._id.toString()] = d;
});

const resultado = ids.map(id => {
    const disco = discosMap[id]
    if (!disco) return null;

    return {
        disco,
        visualizacoes: scoresMap[id]
    };
}).filter(Boolean);
///////////////////////////////////////////////////////////////////////

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

module.exports = {
    listarDiscos,
    buscaDiscoID,
    criarDisco,
    atualizarDisco,
    deletarDisco,
    rankingDiscos,
};