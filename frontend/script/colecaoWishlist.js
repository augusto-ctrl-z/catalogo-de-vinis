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

        if(colecaoAberta){
            carregarMinhaColecao();
        }
    } else {
        const data = await response.json();
        alert(data.erro || 'Falha ao adicionar');
    }

};

async function removerDaColecao(discoID) {
    if (!usuarioLogado){
        alert('Necessário fazer login');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/colecao/${discoID}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if(response.ok){
            alert('Disco removido da coleção');
            carregarMinhaColecao();
        } else {
            alert(data.erro || 'Falha ao remover');
        }
    } catch (error) {
        console.error('Erro ao remover da coleção:', error);
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

            <button onclick="event.stopPropagation(); removerDaColecao('${disco._id}')"
                style="background-color: #600f1c;"> ✖ </button>
        </div>
                    `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Falha ao carregar coleção:', error);
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

                        <button onclick="event.stopPropagation(); removerDaListaDesejos('${disco._id}')"
                style="background-color: #600f1c;"> ✖ </button>
        </div>
                    `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Falha ao carregar lista de desejos:', error);
    }
};

async function removerDaListaDesejos(discoID) {
    if (!usuarioLogado) {
        alert('Necessário fazer login');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/desejos/${discoID}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if(response.ok) {
            alert('Disco removido da lista de desejos');
            carregarDesejos();
        } else {
            alert(data.erro || 'Erro ao remover');
        }
    } catch (error) {
        console.error('Erro ao remover da lista:', error);
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

        if(listaAberta) {
            carregarDesejos();
        }
    } else {
        const data = await response.json();
        alert(data.erro || 'Falha ao adicionar');
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