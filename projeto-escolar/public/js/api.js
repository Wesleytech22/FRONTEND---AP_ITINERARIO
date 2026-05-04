// Configuração da API
const API_URL = 'http://localhost:3000/api';

// Armazenar token
let authToken = localStorage.getItem('token');

// Função de login
async function login(email, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            return { success: true, usuario: data.usuario };
        } else {
            return { success: false, error: 'Email ou senha inválidos' };
        }
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, error: 'Erro ao conectar ao servidor' };
    }
}

// Função de logout
function logout() {
    authToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioPerfil');
    
    // Redirecionar para a página de login
    window.location.href = '/login.html';
}

// Função para fazer requisições autenticadas
async function fetchAPI(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        // Token expirado, fazer logout
        logout();
        throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    return response.json();
}

// Verificar se está logado
function isAuthenticated() {
    return authToken !== null && localStorage.getItem('token') !== null;
}

// Obter usuário atual
function getCurrentUser() {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
}

// Obter perfil do usuário
function getUserPerfil() {
    const user = getCurrentUser();
    return user ? user.perfil : null;
}

// Verificar se é coordenador
function isCoordenador() {
    const perfil = getUserPerfil();
    return perfil === 'coordenador' || perfil === 'direcao';
}

// Verificar se é diretor
function isDiretor() {
    return getUserPerfil() === 'direcao';
}

// Verificar se é professor
function isProfessor() {
    return getUserPerfil() === 'professor';
}

// API endpoints
const api = {
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    getUserPerfil,
    isCoordenador,
    isDiretor,
    isProfessor,
    
    // Alunos
    getAlunos: () => fetchAPI('/alunos'),
    getAluno: (id) => fetchAPI(`/alunos/${id}`),
    createAluno: (aluno) => fetchAPI('/alunos', { method: 'POST', body: JSON.stringify(aluno) }),
    updateAluno: (id, aluno) => fetchAPI(`/alunos/${id}`, { method: 'PUT', body: JSON.stringify(aluno) }),
    deleteAluno: (id) => fetchAPI(`/alunos/${id}`, { method: 'DELETE' }),
    
    // Turmas
    getTurmas: () => fetchAPI('/turmas'),
    getTurma: (id) => fetchAPI(`/turmas/${id}`),
    
    // Ocorrências
    getOcorrencias: (alunoId) => fetchAPI(`/ocorrencias/aluno/${alunoId}`),
    registrarFalta: (data) => fetchAPI('/ocorrencias/falta', { method: 'POST', body: JSON.stringify(data) }),
    registrarComportamento: (data) => fetchAPI('/ocorrencias/comportamento', { method: 'POST', body: JSON.stringify(data) }),
    
    // Laudos
    getLaudos: (alunoId) => fetchAPI(`/laudos/aluno/${alunoId}`),
    uploadLaudo: (formData) => {
        return fetch(`${API_URL}/laudos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        }).then(res => res.json());
    }
};

// Exportar para uso global
window.api = api;
window.login = login;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.getUserPerfil = getUserPerfil;
window.isCoordenador = isCoordenador;
window.isDiretor = isDiretor;
window.isProfessor = isProfessor;