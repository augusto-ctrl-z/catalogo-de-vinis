const express = require('express');
const router = express.Router();
const discoController = require('../controllers/discoController');

// ranking de videos
router.get('/ranking/views', discoController.rankingDiscos);
router.get('/teste', (req, res) => {
    res.json({ mensagem: 'rota funcionando' });
});

router.get('/', discoController.listarDiscos);
router.get('/:id', discoController.buscaDiscoID);
router.post('/', discoController.criarDisco);
router.put('/:id', discoController.atualizarDisco);
router.delete('/:id', discoController.deletarDisco);

module.exports = router;