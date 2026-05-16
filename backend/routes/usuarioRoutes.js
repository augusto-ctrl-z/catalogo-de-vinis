const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// avaliações
router.get('/avaliacoes/:discoID', usuarioController.buscarAvaliacoes);
router.post('/avaliar/:discoID', usuarioController.avaliarDisco);
router.put('/avaliar/:discoID', usuarioController.atualizarAvaliacao);
router.delete('/avaliar/:discoID', usuarioController.deletarAvaliacao);

//coleção
router.post('/colecao', usuarioController.adicionarNaColecao);
router.delete('/colecao/:discoID', usuarioController.removerDaColecao);
router.get('/minha-colecao', usuarioController.minhaColecao);

// lista de desejos
router.post('/desejos', usuarioController.adicionarDesejados);
router.delete('/desejos/:discoID', usuarioController.removerDesejados);
router.get('/lista-desejos', usuarioController.meusDesejos);


// rotas de autenticação
router.post('/login', usuarioController.login);
router.post('/logout', usuarioController.logout);
router.get('/sessao', usuarioController.verificarSessao); // verifica se estou logado
router.get('/perfil', usuarioController.perfil); // pega meus dados, caso esteja logado

router.get('/', usuarioController.listarUsuarios);
router.get('/:id', usuarioController.buscarUsuarioID);
router.post('/', usuarioController.criarUsuario);
router.put('/:id', usuarioController.atualizarUsuario);
router.delete('/:id', usuarioController.deletarUsuario);



module.exports = router;