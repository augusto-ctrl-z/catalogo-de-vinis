const express = require('express');
const router = express.Router();
const discoController = require('../controllers/discoController');



router.get('/', discoController.listarDiscos);

// ranking 10 mais acessados
router.get('/ranking', discoController.rankingDiscos);

router.get('/:id', discoController.buscaDiscoID);
router.post('/', discoController.criarDisco);
router.put('/:id', discoController.atualizarDisco);
router.delete('/:id', discoController.deletarDisco);

module.exports = router;