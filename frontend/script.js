const API_URL = 'http://localhost:3000/api';

let usuarioLogado = null;
let discoSelecionado = null;


// COLEÇÃO E LISTA DE DESEJOS ///////////////////////////////////////

let colecaoAberta = false;
let listaAberta = false;



async function adicionarColecao(){
    if(!usuarioLogado) {
        alert('Necessário fazer login para continuar');
        return;
    }

    if(!discoSelecionado) {
        alert('Nenhum disco selecionado');
        return;
    }

    //pega a rota e faz um post com o id do disco
    const response = await fetch(`${API_URL}/usuarios/colecao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discoID: discoSelecionado._id }),
        credentials: 'include'
    })

    if (response.ok) {
        alert('Disco adicionado à coleção');
    } else {
        const data = await response.json();
        alert(data.erro || 'Falha ao adicionar');
    }

};

async function adicionarListaDesejos(){
    if(!usuarioLogado) {
        alert('Necessário fazer login para continuar');
        return;
    }

    if(!discoSelecionado) {
        alert('Nenhum disco selecionado');
        return;
    }

    const response = await fetch(`${API_URL}/usuarios/desejos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discoID: discoSelecionado._id }),
        credentials: 'include'
    })

    if (response.ok) {
        alert('Disco adicionado à lista de desejos');
    } else {
        const data = await response.json();
        alert(data.erro || 'Falha ao adicionar');
    }

};

async function carregarDesejos(){
    if (!usuarioLogado) {
        alert('Necessário fazer login para continuar');
        return;
    }

    try {

        // pedir lista ao backend
        const response = await fetch(`${API_URL}/usuarios/lista-desejos`, {
            credentials: 'include'
        });
        const discos = await response.json();

        const container = document.getElementById('minha-lista-desejos');
        container.innerHTML = '';
        discos.forEach(disco => {
            const div = document.createElement('div');
            div.className = 'desejados-item';
            div.onclick = () => mostrarDetalhesDisco(disco);
            div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${disco.capaUrl || 'https://via.placeholder.com/300x300?text=Sem+Capa'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 2px;">
                <div>
                    <div class="disco-titulo">${disco.titulo}</div>
                <div class="disco-artista">${disco.artista} (${disco.ano})
                </div>
            </div>
        </div>
                    `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Falha ao carregar lista de desejos:', error);
    }
};

async function carregarMinhaColecao(){
    if (!usuarioLogado) {
        alert('Necessário fazer login para continuar');
        return;
    }

    try {

        // pedir colecao ao backend
        const response = await fetch(`${API_URL}/usuarios/minha-colecao`, {
            credentials: 'include'
        });
        const discos = await response.json();

        const container = document.getElementById('minha-colecao-lista');
        container.innerHTML = '';
        discos.forEach(disco => {
            const div = document.createElement('div');
            div.className = 'colecao-item';
            div.onclick = () => mostrarDetalhesDisco(disco);
            div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${disco.capaUrl || 'https://via.placeholder.com/300x300?text=Sem+Capa'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 2px;">
                <div>
                    <div class="disco-titulo">${disco.titulo}</div>
                <div class="disco-artista">${disco.artista} (${disco.ano})
                </div>
            </div>
        </div>
                    `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Falha ao carregar coleção:', error);
    }
};

// Abrir fechar aba
async function toggleMinhaColecao(){
    const area = document.getElementById('colecao-area');

    // Se já tiver aberta, fecha
    if (colecaoAberta) {
        area.style.display = 'none';
        colecaoAberta = false;
        return;
    } else {
        await carregarMinhaColecao();
        area.style.display = 'block';
        colecaoAberta = true;
        if(listaAberta){
            document.getElementById('meus-desejos-area').style.display = 'none';
            listaAberta = false;
        }
    }
};

// Abrir fechar aba
async function toggleListaDeDesejos(){
    const area = document.getElementById('meus-desejos-area');

    // Se já tiver aberta, fecha
    if (listaAberta) {
        area.style.display = 'none';
        listaAberta = false;
        return;
    } else {
        await carregarDesejos();
        area.style.display = 'block';
        listaAberta = true;
        if(colecaoAberta){
            document.getElementById('colecao-area').style.display = 'none';
            colecaoAberta = false;
        }
    }
};

// COLEÇÃO E LISTA DE DESEJOS /////////////////////////////////

async function fazerLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email, senha }),// converte para json
            credentials: 'include' // envia o cookie da sessão
        });

        // resposta do backend
        const data = await response.json();

        if (response.ok) { // se der certo
            usuarioLogado = data.usuario;

            console.log('Usuario logado:', usuarioLogado);
            console.log('Permissão de admin:', usuarioLogado.isAdmin);

            // tira a tela de login e põe a de usuario
            document.getElementById('login-area').style.display = 'none';
            document.getElementById('registro-area').style.display = 'none';
            document.getElementById('user-area').style.display = 'block';
            document.getElementById('user-nome').textContent = usuarioLogado.nome;

            const adminActions = document.getElementById('admin-actions');
            const adminDelete = document.getElementById('admin-delete');
            if (adminActions) {
                if (usuarioLogado.isAdmin === true) {
                    if (adminActions) adminActions.style.display = 'block';
                    if (adminDelete) adminDelete.style.display = 'block';

                } else {
                    if (adminActions) adminActions.style.display = 'none';
                    if (adminDelete) adminDelete.style.display = 'none';
                }
            }

            carregarDiscos(); // carrega a lista de discos
        } else {
            document.getElementById('login-status').textContent = data.erro;
        }
    } catch (error) {
        console.error('Erro no login', error);
    }
};

async function fazerLogout() {
    console.log('🚶🏻 Fazendo logout...');

    try {
        const response = await fetch(`${API_URL}/usuarios/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            usuarioLogado = null;
            document.getElementById('login-area').style.display = 'block';
            document.getElementById('user-area').style.display = 'none';
            document.getElementById('registro-area').style.display = 'block';
            document.getElementById('avaliacao-area').style.display = 'none';
            console.log('Logout realizado com sucesso');

            const adminActions = document.getElementById('admin-actions');
            const adminDelete = document.getElementById('admin-delete');
            if (adminActions) { adminActions.style.display = 'none'; }
            if (adminDelete) { adminDelete.style.display = 'none';}
        }
    } catch (error) {
        console.error('Erro no logout:', error);
    }
};

async function registrarUsuario() {
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;

    if (!nome || !email || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Usuário registrado com sucesso! Faça login.');
            document.getElementById('reg-nome').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-senha').value = '';
            document.getElementById('registro-status').textContent = '✅ Registrado! Faça login.';
        } else {
            document.getElementById('registro-status').textContent = data.erro || 'Falha ao registrar';
        }
    } catch (error) {
        console.error('Falha ao registrar:', error);
        document.getElementById('registro-status').textContent = 'Falha ao registrar';
    }
};



async function carregarDiscos(){
    try {


        // pedir a lista de discos ao backend
        const response = await fetch(`${API_URL}/discos`);
        const discos = await response.json();

        const container = document.getElementById('discos-lista');
        container.innerHTML = ''; // limpa a tela antes de adicionar

        // para cada disco, cria uma caixa vazia na tela
        discos.forEach(disco => {
            const div = document.createElement('div');
            div.className = 'disco-item';
            div.onclick = () => mostrarDetalhesDisco(disco); // mostra os detalhes do disco ao ser clicado
            // preenche as caixas com titulo e artista
            div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${disco.capaUrl || 'https://via.placeholder.com/300x300?text=Sem+Capa'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 2px;">
                <div>
                    <div class="disco-titulo">${disco.titulo}</div>
                <div class="disco-artista">${disco.artista} (${disco.ano})
                </div>
            </div>
        </div>
                    `;
            container.appendChild(div); //põe a "caixa" na lista
        });
    } catch (error) {
        console.error('Erro ao carregar discos:', error);
    }
};

function previewCapa(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('capa-preview-img');
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file)
    }
};

function fecharDetalhes() {
    const area = document.getElementById('avaliacao-area');
    area.style.display = 'none';
}

async function mostrarDetalhesDisco(disco) {
    discoSelecionado = disco;

    await carregarFaixas(disco._id);

    // Busca avaliações do disco escolhido
    const response = await fetch(`${API_URL}/usuarios/avaliacoes/${disco._id}`, {
        credentials: 'include'
    });
    const avaliacoesData = await response.json();

    // mostra a area de avaliação
    const avaliacaoArea = document.getElementById('avaliacao-area');
    avaliacaoArea.style.display = 'block';

    // mostra o nome do disco e a nota média
    document.getElementById('avaliacao-disco-nome').innerHTML = `
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <img src="${disco.capaUrl || 'https://via.placeholder.com/300x300?text=Sem+Capa'}" 
                 style="width: 300px; height: 300px; object-fit: cover; border-radius: 8px; border: 1px solid #600f1c;">
            <div>
                <h3 style="margin: 0 0 10px 0;">${disco.titulo}</h3>
                <p><strong>Artista:</strong> ${disco.artista}</p>
                <p><strong>Ano:</strong> ${disco.ano}</p>
                <p><strong>Gênero:</strong> ${disco.genero?.join(', ') || 'N/A'}</p>
                <p><strong>Gravadora:</strong> ${disco.gravadora || 'N/A'}</p>
                <p><strong>Avaliação média:</strong> ${disco.averageRating || 0} ⭐</p>
            </div>
        </div>
    `;

    // botão oculto de admins
    const adminActions = document.getElementById('admin-actions');
    if (adminActions){
        if(usuarioLogado && usuarioLogado.isAdmin === true) {
            adminActions.style.display = 'block';
            console.log('✅ Admin detectado, botão de deletar visível');
        } else {
            adminActions.style.display = 'none';
            console.log('❌ Usuário não é admin ou não está logado');
        }
    }


    if (avaliacoesData.avaliacoes && avaliacoesData.avaliacoes.length > 0) {
        let avaliacoesHtml = '<h3> Seção de avaliações:</h3>';
        avaliacoesData.avaliacoes.forEach(av => {
            avaliacoesHtml += `
            <div class="avaliacao">
                <strong>${av.usuario}</strong> - Nota ${av.nota} ⭐<br><br>
                <strong>💿 Faixa favorita: ${av.trackFavorita || 'Nenhuma'}
                <p>${av.comentario || ''}</p>
            </div>
            `;
        });
        document.getElementById('avaliacao-status').innerHTML = avaliacoesHtml;

        mostrarMinhaAvaliacao(avaliacoesData.avaliacoes, usuarioLogado);
    }
};




async function deletarDisco() {

    if (!usuarioLogado || !usuarioLogado.isAdmin) {
        alert('Apenas administradores podem deletar discos');
        return;
    }

    const adminActions = document.getElementById('admin-actions');
    if (adminActions) {
        if (usuarioLogado.isAdmin === true){
            adminActions.style.display = 'block';
        } else {
            adminActions.style.display = 'none';
        }
    }

    if (!discoSelecionado) {
        alert('Nenhum disco selecionado');
        return;
    }

    const confirmar = confirm(`Tem certeza que deseja deletar "${discoSelecionado.titulo}"?`);
    if (!confirmar) return;

    try {
        const response = await fetch(`${API_URL}/discos/${discoSelecionado._id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Disco deletado com sucesso!');
            document.getElementById('avaliacao-area').style.display = 'none';
            carregarDiscos();
            discoSelecionado = null;
        } else {
            const error = await response.json();
            alert(error.erro || 'Falha ao deletar disco');
        }
    } catch (error) {
        console.error('Falha ao deletar', error);
        alert('Falha ao deletar disco');
    }
};

async function enviarAvaliacao() {
    if (!usuarioLogado) {
        alert('Login necessário!');
        return;
    }

    const nota = parseInt(document.getElementById('avaliacao-nota').value);
    const comentario = document.getElementById('avaliacao-comentario').value;
    const trackFavoritaID = document.getElementById('avaliacao-track').value;

    const response = await fetch(`${API_URL}/usuarios/avaliar/${discoSelecionado._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            discoID: discoSelecionado._id,
            nota: nota,
            comentario: comentario,
            trackFavoritaID: trackFavoritaID || null
        }),
        credentials: 'include'
    });

    if (response.ok) {
        alert('Avaliação enviada!');
        mostrarDetalhesDisco(discoSelecionado);
        carregarDiscos();
    }
};

// Variável para guardar avaliação atual do usuário
let minhaAvaliacao = null;

// mostrar avaliação do usuário logado
function mostrarMinhaAvaliacao(avaliacoes, usuarioLogado) {
    const minha = avaliacoes.find(av => av.usuario === usuarioLogado.nome);

    const div = document.getElementById('minha-avaliacao');

    if (minha) {
        minhaAvaliacao = minha;
        div.style.display = 'block';
        document.getElementById('minha-avaliacao-content').innerHTML = `
        <strong>Nota: ${minha.nota}⭐</strong>
        <p>${minha.comentario || ''}</p>
        ${minha.trackFavorita ? `<small>💿 Faixa favorita: ${minha.trackFavorita}</small>` : ''}
        `;
    } else {
        div.style.display = 'none';
    }
}

// Editar avaliação
async function editarMinhaAvaliacao() {
    const novaNota = prompt('Nova nota (1-5):', minhaAvaliacao?.nota || 5);
    const novoComentario = prompt('Novo comentário:', minhaAvaliacao?.comentario || '');

    if (!novaNota) return;

    try {
        const response = await fetch(`${API_URL}/usuarios/avaliar/${discoSelecionado._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                discoID: discoSelecionado._id,
                nota: parseInt(novaNota),
                comentario: novoComentario || ''
            }),
            credentials: 'include'
        });

        if (response.ok) {
            alert('Avaliação alterada!');
            mostrarDetalhesDisco(discoSelecionado);
            carregarDiscos();
        } else {
            const error = await response.json();
            alert(error.erro || 'Erro ao atualizar');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function deletarMinhaAvaliacao() {
    if (!confirm('Tem certeza que deseja deletar sua avaliação?')) return;

    try {
        const response = await fetch(`${API_URL}/usuarios/avaliar/${discoSelecionado._id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Avaliação deletada!');
            mostrarDetalhesDisco(discoSelecionado);
            carregarDiscos();
        } else {
            const error = await response.json();
            alert(error.erro || 'Falha ao deletar');
        }
    } catch (error) {
        console.error('Erro', error);
    }
};

function adicionarCampoFaixa() {
    const container = document.getElementById('faixas-container');
    const div = document.createElement('div');
    div.className = 'faixa-item';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="text" placeholder="Nome da faixa" class="faixa-nome" style="width: 60%;">
        <input type="text" placeholder="Duração (MM:SS)" class="faixa-duracao" style="width: 30%;">
        <button type="button" onclick="removerCampoFaixa(this)" style="background-color: #600f1c; width: 8%;">✖</button>
    `;
    container.appendChild(div);
};

function removerCampoFaixa(botao) {
    botao.parentElement.remove();
};

function coletarFaixas() {
    const faixas = [];
    const nomes = document.querySelectorAll('.faixa-nome');
    const duracoes = document.querySelectorAll('.faixa-duracao');

    for (let i = 0; i < nomes.length; i++){
        if (nomes[i].value.trim()) {
            faixas.push({
                nome: nomes[i].value.trim(),
                duracao: duracoes[i]?.value.trim() || ''
            });
        }
    }
    return faixas;
}

async function carregarFaixas(discoID) {
    try {
        const response = await fetch(`${API_URL}/discos/${discoID}`);
        const disco = await response.json();

        const trackSelect = document.getElementById('avaliacao-track');
        trackSelect.innerHTML = '<option value="">-- Nenhuma faixa específica --</option>';

        if (disco.faixas && disco.faixas.length > 0) {
            disco.faixas.forEach(faixa => {
                const option = document.createElement('option');
                option.value = faixa._id;
                option.textContent = `${faixa.nome} (${faixa.duracao || '?'})`;
                trackSelect.appendChild(option);
            });
        } 
     } catch (error) {
            console.error('Erro ao carregar faixas:', error);
     }
};

function mostrarFormularioDisco() {
    document.getElementById('form-disco').style.display = 'block';
};

function fecharFormulario(){
    document.getElementById('form-disco').style.display = 'none';
    document.getElementById('disco-status').textContent = '';
}

function converterImagemParaBase64(file) {
    return new Promise((resolve, reject) => {

        if (file.size > 300 * 1024) {
            reject(new Error('Imagem muito grande. Sua imagem deve ter no máximo 300KB.'));
            alert('Imagem muito grande! Use uma imagem menor (máximo 300KB).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

async function adicionarDisco(){
    if (!usuarioLogado || !usuarioLogado.isAdmin) {
        alert('Apenas administradores podem adicionar discos');
        return;
    }

    const titulo = document.getElementById('disco-titulo').value;
    const artista = document.getElementById('disco-artista').value;
    const ano = parseInt(document.getElementById('disco-ano').value);
    const genero = document.getElementById('disco-genero').value;
    const gravadora = document.getElementById('disco-gravadora').value;
    const faixas = coletarFaixas();

    const capaUrl = document.getElementById('disco-capa-url').value;

    if (!titulo || !artista || !ano) {
        alert('Título, artista e ano são obrigatórios!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/discos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo,
                artista,
                ano,
                genero: genero ? [genero] : [],
                gravadora: gravadora || '',
                faixas: faixas,
                capaUrl: capaUrl
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok){
            alert('Disco adicionado com sucesso!');
            fecharFormulario();
            await carregarDiscos();
            // limpar os campos
            document.getElementById('disco-titulo').value = '';
            document.getElementById('disco-artista').value = '';
            document.getElementById('disco-ano').value = '';
            document.getElementById('disco-genero').value = '';
            document.getElementById('disco-gravadora').value = '';
            document.getElementById('disco-capa-url').value = '';
            document.getElementById('capa-preview-img').style.display = 'none';

        } else {
            document.getElementById('disco-status').textContent = data.erro || 'Falha ao adicionar disco';
        }
    } catch (error) {
        console.error('Falha ao adicionar disco:', error);
        document.getElementById('disco-status').textContent = 'Falha ao adicionar disco';
    }
};


async function verificarSessao() {
    const response = await fetch(`${API_URL}/usuarios/sessao`, {
        credentials: 'include'
    });
    const data = await response.json();

    if (data.logado) {
        // Se já estiver logado, mostrará a área do usuário
        usuarioLogado = { id: data.usuarioID, nome: data.usuarioNome, isAdmin: data.isAdmin || false };
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('registro-area').style.display = 'none';
        document.getElementById('user-area').style.display = 'block';
        document.getElementById('user-nome').textContent = usuarioLogado.nome;

        const adminActions = document.getElementById('admin-actions');
        const adminDelete = document.getElementById('admin-delete');
        if (adminActions) {
            if (usuarioLogado.isAdmin === true){
                if (adminActions) adminActions.style.display = 'block';
                if (adminDelete) adminDelete.style.display = 'block';
            } else {
                if (adminActions) adminActions.style.display = 'none';
                if (adminDelete) adminDelete.style.display = 'none';
            }
        }
    }
    carregarDiscos();
}

verificarSessao();
