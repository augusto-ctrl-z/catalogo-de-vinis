const API_URL = 'http://localhost:3000/api';

let usuarioLogado = null;
let discoSelecionado = null;
let todosDiscos = [];


let colecaoAberta = false;
let listaAberta = false;

//verirficarSessao();

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

window.usuarioLogado = null;
window.discoSelecionado = null;

window.colecaoAberta = false;
window.listaAberta = false;

window.API_URL = 'http://localhost:3000/api';


window.onload = async () => {
    await verificarSessao();

    await carregarDiscos();
    await carregarRanking();
}

