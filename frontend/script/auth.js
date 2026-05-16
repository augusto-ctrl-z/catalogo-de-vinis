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