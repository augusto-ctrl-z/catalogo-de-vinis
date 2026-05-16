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
};