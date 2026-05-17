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

            await carregarDiscos();

            if (colecaoAberta) {
                await carregarMinhaColecao();
            }

            if (listaAberta) {
                await carregarDesejos();
            }

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

//window.mostrarFormularioDisco = mostrarFormularioDisco;
//window.fecharFormulario = fecharFormulario;

//window.converterImagemParaBase64 = converterImagemParaBase64;

window.adicionarDisco = adicionarDisco;
window.deletarDisco = deletarDisco;