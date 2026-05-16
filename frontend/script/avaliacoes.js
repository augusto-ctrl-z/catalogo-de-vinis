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
};

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