async function carregarDiscos(){
    try {


        // pedir a lista de discos ao backend
        const response = await fetch(`${API_URL}/discos`);
        todosDiscos = await response.json();

        renderizarDiscos(todosDiscos);

    } catch (error) {
        console.error('Falha ao carregar discos:', error);
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

function renderizarDiscos(discos) {

    const container = document.getElementById('discos-lista');

    container.innerHTML = '';

    if (discos.length === 0) {
        container.innerHTML = '<p>Nenhum disco encontrado.</p>';
        return;
    }

    discos.forEach(disco => {

        const div = document.createElement('div');
        div.className = 'disco-item';
        div.onclick = () => mostrarDetalhesDisco(disco);

        div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="${disco.capaUrl || 'https://via.placeholder.com/300x300?text=Sem+Capa'}"
                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 2px;">

            <div>
                <div class="disco-titulo">${disco.titulo}</div>
                <div class="disco-artista">
                    ${disco.artista} (${disco.ano})
                </div>
                <div>
                    ⭐ ${disco.averageRating || 0}
                </div>
            </div>
        </div>
        `;

        container.appendChild(div);
    })
};

function filtrarDiscos() {
    const termo = document.getElementById('busca-disco')
        .value
        .toLowerCase();

    const discosFiltrados = todosDiscos.filter(disco => 
        disco.titulo.toLowerCase().includes(termo) ||
        disco.artista.toLowerCase().includes(termo) ||
        disco.genero?.join(' ').toLowerCase().includes(termo)
    );

    renderizarDiscos(discosFiltrados);
};

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

    const avaliacaoStatus = document.getElementById('avaliacao-status');
    avaliacaoStatus.innerHTML = '';

    if (avaliacoesData.avaliacoes && avaliacoesData.avaliacoes.length > 0) {

        let avaliacoesHtml = '<h3>Avaliações:</h3>';

        avaliacoesData.avaliacoes.forEach(av => {
            avaliacoesHtml += `
            <div class="avaliacao">
                <strong>${av.usuario}</strong> - Nota ${av.nota} ⭐<br><br>
                <strong>💿 Faixa favorita: ${av.trackFavorita || 'Nenhuma'}</strong>
                <p>${av.comentario || ''}</p>
            </div>
            `;
        });
        
        avaliacaoStatus.innerHTML = avaliacoesHtml;

        mostrarMinhaAvaliacao(avaliacoesData.avaliacoes, usuarioLogado);
    } else {
        avaliacaoStatus.innerHTML = '<p>Nenhuma avaliação ainda</p>'

        document.getElementById('minha-avaliacao').style.display = 'none';
    }
};

window.carregarDiscos = carregarDiscos;
window.previewCapa = previewCapa;

window.fecharDetalhes = fecharDetalhes;
window.mostrarDetalhesDisco = mostrarDetalhesDisco;

//window.adicionarCampoFaixa = adicionarCampoFaixa;
//window.removerCampoFaixa = removerCampoFaixa;

window.renderizarDiscos = renderizarDiscos;
window.filtrarDiscos = filtrarDiscos;

//window.carregarFaixas = carregarFaixas;
//window.mostrarBusca = mostrarBusca;