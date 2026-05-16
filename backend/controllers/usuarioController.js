const redisClient = require('../config/redis');
const Usuario = require('../models/Usuario');
const Disco = require('../models/Disco');

// Avaliações e comentários

// calcula a nota média do disco baseado nas avaliações feitas
const calcularNotaDisco = async (discoID) => {
    const usuarios = await Usuario.find({ // pega todos os usuarios que avaliaram aquele disco
        'avaliacoes.discoID': discoID // procura as avaliações do usuário com este ID
    });

    let soma = 0;
    let total = 0;

    // para cada usuário
    usuarios.forEach(usuario => {
        // para cada avaliação (deste) usuário específico
        usuario.avaliacoes.forEach(avaliacao => {
            
            // se a avaliação for do mesmo disco do id requisitado
            if (avaliacao.discoID.toString() === discoID) {
                // soma a nota
                soma += avaliacao.nota;
                // incrementa o total de avaliações
                total++;
            }
        });
    });

    // calcular a média
    // '?' e ':' têm função de if else, caso total seja maior que zero
    // ele faz a conta da média
    const media = total > 0 ? soma / total : 0;

    // atualizar o a nova média
    await Disco.findByIdAndUpdate(discoID, { averageRating: parseFloat(media.toFixed(2)) }); // duas casas flutuantes
};

// o usuário avalia com uma nota e comentário
const avaliarDisco = async (req, res) => {
    try {
        const { discoID, nota, comentario, trackFavoritaID } = req.body;

        //verifica se o usuário está logado
        if (!req.session.usuarioID) {
            return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        //verifica se o disco existe no banco
        const disco = await Disco.findById(discoID);
        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado' });
        }

        // a nota deve estar entre 1 e 5
        if (nota < 1 || nota > 5) {
            return res.status(400).json({ erro: 'Sua avaliação deve estar entre 1 e 5' });
        }

        // busca o usuário logado
        const usuario = await Usuario.findById(req.session.usuarioID);

        // verifica se esse usuário já avaliou esse disco antes
        // .some() verifica se existe algum item que atenda a condição
        const jaAvaliou = usuario.avaliacoes.some(a => a.discoID.toString() === discoID);
        if (jaAvaliou) {
            return res.status(400).json({ erro: 'Você já avaliou este disco' });
        }

        if (trackFavoritaID) {
            const disco = await Disco.findById(discoID);
            const trackExiste = disco.faixas.some(f => f._id.toString() === trackFavoritaID);
            if (!trackExiste) {
                return res.status(400).json({ erro: 'Esta faixa não se encontra no disco' });
            }
        }

        // adiciona a nova avaliação na lista de usuarios

        usuario.avaliacoes.push({
            discoID, // disco avaliado
            nota, //nota dada (1-5)
            comentario: comentario || '', // comentário (deixa vazio se não tiver)
            trackFavoritaID: trackFavoritaID || null,
            data: new Date() // data atual
        });

        // salva o usuário no banco
        await usuario.save();

        //calcula a nova média do disco
        await calcularNotaDisco(discoID);

        res.json({
            mensagem: 'Avaliação enviada com sucesso!',
            avaliacao: { nota, comentario: comentario || '' }
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

const buscarAvaliacoes = async (req, res) => {
    try {

        // pega o id do disco que veio na URL
        const { discoID } = req.params;

        const disco = await Disco.findById(discoID);
        if (!disco){
            return res.status(404).json({ erro: 'Disco não encontrado' });
        }

        const tracksMap = {};
        disco.faixas.forEach(faixa => {
            tracksMap[faixa._id.toString()] = faixa.nome;
        })

        const usuarios = await Usuario.find({ 'avaliacoes.discoID': discoID }).select('nome avaliacoes'); // "só traga nome e avaliações"
        
        const avaliacoes = [];
        usuarios.forEach(usuario => { //mais uma vez, percorre os usuarios
            usuario.avaliacoes.forEach(avaliacao => { // percorre as avaliações do usuário desejado
                if (avaliacao.discoID.toString() === discoID) {
                    avaliacoes.push({
                        usuario: usuario.nome,
                        nota: avaliacao.nota,
                        comentario: avaliacao.comentario,
                        trackFavorita: avaliacao.trackFavoritaID ? tracksMap[avaliacao.trackFavoritaID.toString()] || 'Faixa não encontrada' : null,
                        data: avaliacao.data
                    });
                }
            });
        });

        // ordena do mais recente pro mais antigo
        avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

        res.json({
            disco: disco.titulo,
            media: disco.averageRating,
            totalAvaliacoes: avaliacoes.length,
            avaliacoes
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// atualizar avaliação
const atualizarAvaliacao = async (req, res) => {
    try {
        // pega o id do disco requisitado
        const { discoID, nota, comentario, trackFavoritaID} = req.body;

        // verifica se o disco existe no banco
        const disco = await Disco.findById(discoID);
            if (!disco) {
                return res.status(404).json({ erro: 'Disco não encontrado' })
            };

        // busca o usuário da sessão atual
        const usuario = await Usuario.findById(req.session.usuarioID);

        const jaAvaliou = usuario.avaliacoes.some(a => a.discoID.toString() === discoID);
        if(!jaAvaliou){
            return res.status(400).json({ erro: 'Você não avaliou este disco ainda '});
        }

        const avaliacao = usuario.avaliacoes.find(a => a.discoID.toString() === discoID);
        if (avaliacao){
            avaliacao.nota = nota;
            avaliacao.comentario = comentario || '';
            if (trackFavoritaID) avaliacao.trackFavoritaID = trackFavoritaID;
            avaliacao.data = new Date();
        }

        // salva o usuário e recalcula a nota
        await usuario.save();
        await calcularNotaDisco(discoID);

        let nomeTrackFavorita = null;
        if (avaliacao.trackFavoritaID) {
            const track = disco.faixas.find(f => f._id.toString() === avaliacao.trackFavoritaID.toString());
            nomeTrackFavorita = track ? track.nome : 'Faixa não encontrada';
        }

        res.json({
            mensagem: 'Avaliação editada com sucesso!',
            avaliacao: { nota, comentario: comentario || '', trackFavorita: nomeTrackFavorita }
        });
    } catch (error){
        res.status(500).json({ erro: error.message });
    }
};

// deletar atualização
const deletarAvaliacao = async (req, res) => {
    try {
        const { discoID } = req.params;

        if(!req.session.usuarioID) {
            return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        const disco = await Disco.findById(discoID);
        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado' });
        }

        const usuario = await Usuario.findById(req.session.usuarioID);

        const avaliacaoExistente = usuario.avaliacoes.some(a => a.discoID.toString() === discoID);
        if (!avaliacaoExistente) {
            return res.status(400).json({ erro: 'Avaliação não encontrada' });
        }

        usuario.avaliacoes = usuario.avaliacoes.filter(a => a.discoID.toString() !== discoID);

        await usuario.save();

        await calcularNotaDisco(discoID);
        
        res.json({ mensagem: 'Avaliação removida com sucesso' });
    } catch (error) {
        res.status.json({ erro: error.message });
    }
};

// Coleções do usuário (favoritos, lista de desejos...)
const adicionarNaColecao = async (req, res) => {
    try {
        const { discoID } = req.body; // pega o id do disco da requisição

        // verifica sessão
        if (!req.session.usuarioID){
            return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        // verifica se esse disco existe
        const disco = await Disco.findById(discoID);
        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado' });
        }

        // busca o usuario logado
        const usuario = await Usuario.findById(req.session.usuarioID);

        if (usuario.colecao.includes(discoID)){
            return res.status(400).json({ erro: 'Esse disco já existe em sua coleção' });
        }

        usuario.colecao.push(discoID);
        await usuario.save();

        res.json({
            mensagem: 'Disco adicionado à sua coleção',
            colecao: usuario.colecao
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// remover
const removerDaColecao = async (req, res) => {
    try{
        const { discoID } = req.body;

        if (!req.session.usuarioID){
            return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        const usuario = await Usuario.findById(req.session.usuarioID);

        // filtrar e manter todos os discos da coleção, exceto o que queremos remover
        usuario.colecao = usuario.colecao.filter(id => id.toString() !== discoID);
        await usuario.save();

        res.json({
            mensagem: 'Disco removido da coleção',
            colecao: usuario.colecao
        });
    } catch (error) {
    res.status(500).json({ erro: error.message });
    }
};

// mostrar colecao
const minhaColecao = async (req, res) => {
    try {
        if (!req.session.usuarioID) {
            return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        const usuario = await Usuario.findById(req.session.usuarioID)
            .populate('colecao') // populate traz os dados completos dos discos

        res.json(usuario.colecao);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// adicionar à lista de desejos
const adicionarDesejados = async (req, res) => {
    try {
        const { discoID } = req.body;

        if (!req.session.usuarioID){
            return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        const usuario = await Usuario.findById(req.session.usuarioID);

        const disco = await Disco.findById(discoID);
        if (!disco) {
                return res.status(404).json({ erro: 'Disco não encontrado' });
        }

        if(usuario.desejados.includes(discoID)) {
                return res.status(400).json({ erro: 'Esse disco já existe na sua lista de desejos' });
        }
        usuario.desejados.push(discoID);
        await usuario.save();

        res.json({
            mensagem: 'Disco adicionado à lista de desejos',
            desejados: usuario.desejados
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// remover da lista
const removerDesejados = async (req, res) => {
    try {
        const { discoID } = req.body;

        if (!req.session.usuarioID){
        return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        const usuario = await Usuario.findById(req.session.usuarioID);

         usuario.desejados = usuario.desejados.filter(id => id.toString() !== discoID);
        await usuario.save();

        res.json({
            mensagem: 'Disco removido da lista de desejos',
            desejados: usuario.desejados
        });
     } catch (error) {
        res.status(500).json({ erro: error.message });
     }
};

// mostrar lista de desejos
const meusDesejos = async (req, res) => {
    try {
        if (!req.session.usuarioID) {
            return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
        }

        const usuario = await Usuario.findById(req.session.usuarioID)
            .populate('desejados') // populate traz os dados completos dos discos

        res.json(usuario.desejados);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};



// Autenticação do usuário

//login
const login = async (req, res) => {
    try {
        // recebe as credenciais
        const { email, senha } = req.body;

        // procura um usuário que já use aquele email
        const usuario = await Usuario.findOne({ email });

        // se o email não for encontrado
        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha inválidos!'});
        }

        const senhaValida = await usuario.compararSenha(senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Email ou senha inválidos!'});
        }

        // salva na sessão como usuário logado
        req.session.usuarioID = usuario._id;
        req.session.usuarioNome = usuario.nome;

        res.json({
            mensagem: 'Login realizado com sucesso',
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                isAdmin: usuario.isAdmin || false
            }
        });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

// logout
const logout = async (req, res) => {
    // apaga a sessão no redis
    req.session.destroy((err) => {
        // se der algum erro ao apagar a sessão
        if (err) {
            return res.status(500).json({ erro: 'Erro ao fazer logout' });
        }

        res.json({ mensagem: 'Logout realizado com sucesso'});
    });
};

// verificar sessão ativa 
const verificarSessao = async (req, res) => {
    if (req.session.usuarioID) {
        const usuario = await Usuario.findById(req.session.usuarioID);
        res.json({
            logado: true,
            usuarioID: req.session.usuarioID,
            usuarioNome: req.session.usuarioNome,
            isAdmin: usuario?.isAdmin || false
        });
    } else {
        // devolve "não está logado"
        res.json({ logado: false });
    }
};

// rota protegida
const perfil = async (req, res) => {
    if (!req.session.usuarioID) { // se não tiver um usuário logado
        return res.status(401).json({ erro: 'Necessário que faça login para continuar' });
    }

    const usuario = await Usuario.findById(req.session.usuarioID).select('-senha');
    res.json(usuario);
}

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
    try {
        // mostrar todos
        const usuarios = await Usuario.find().select('-senha'); // não mostrar a senha
        res.json(usuarios);
    } catch (error){
        res.status(500).json({ erro: error.message });
    }
};

// Buscar usuários por ID

const buscarUsuarioID = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-senha');
        if (!usuario){
            return res.status(404).json({ erro: 'Usuário não encontrado'});
        }
        res.json(usuario);
    } catch (error){
        res.status(500).json({ erro: error.message });
    }
};

// Registrar novo usuário
const criarUsuario = async (req, res) => {
    try{
        const { nome, email, senha } = req.body;

        // verificar se o email já existe
        const emailExiste = await Usuario.findOne({ email });
        if (emailExiste) {
            return res.status(400).json({ erro: 'Esse email em uso!'});
        }

        const usuario = new Usuario({ nome, email, senha });
        await usuario.save();

        const { senha: _, ...usuarioSemSenha } = usuario.toObject();
        res.status(201).json(usuarioSemSenha);

    } catch (error){
        res.status(400).json({ erro: error.message });
    }
};

// Atualizar um usuário registrado
const atualizarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true, runValidators: true }
        ).select('-senha');

        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (error){
        res.status(400).json({ erro: error.message });
    }
};

//Deletar usuário
const deletarUsuario = async (req, res) => {
    try{
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario){
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        res.json({ mensagem: 'Usuário deletado com sucesso' });
    } catch (error){
        res.status(500).json({ erro: error.message });
    }
};

module.exports = {
    listarUsuarios,
    buscarUsuarioID,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,

    // autenticação
    login,
    logout,
    verificarSessao,
    perfil,

    // coleções
    adicionarNaColecao,
    adicionarDesejados,
    minhaColecao,
    removerDaColecao,
    removerDesejados,
    meusDesejos,

    //avaliações
    avaliarDisco,
    deletarAvaliacao,
    buscarAvaliacoes,
    atualizarAvaliacao
};

