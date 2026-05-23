const express = require('express');
const router = express.Router();
const discoController = require('../controllers/discoController');
const isAdmin = require('../middlewares/isAdmin');



router.get('/', discoController.listarDiscos);

// ranking 10 mais acessados
router.get('/ranking', discoController.rankingDiscos);

router.get('/:id', discoController.buscaDiscoID);
router.post('/', isAdmin, discoController.criarDisco);
router.put('/:id', isAdmin, discoController.atualizarDisco);
router.delete('/:id', isAdmin, discoController.deletarDisco);

module.exports = router;