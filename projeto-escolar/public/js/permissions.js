// Sistema de permissões
const PERFIS = {
    PROFESSOR: 'professor',
    COORDENADOR: 'coordenador',
    DIRETOR: 'diretor'
};

function getCurrentUser() {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
}

function getUserPerfil() {
    const user = getCurrentUser();
    return user ? user.perfil : null;
}

function isProfessor() {
    return getUserPerfil() === PERFIS.PROFESSOR;
}

function isCoordenador() {
    return getUserPerfil() === PERFIS.COORDENADOR || getUserPerfil() === PERFIS.DIRETOR;
}

function isDiretor() {
    return getUserPerfil() === PERFIS.DIRETOR;
}

function podeCadastrarAluno() {
    return isCoordenador();
}

function podeDeletarAluno() {
    return isDiretor();
}

function podeVerTodosAlunos() {
    return isCoordenador();
}

function podeRegistrarFalta() {
    return true; // Todos podem
}

function podeRegistrarComportamento() {
    return true; // Todos podem
}

function podeAcessarLaudos() {
    return isCoordenador();
}

function podeGerenciarUsuarios() {
    return isDiretor();
}

// Exportar
window.permissions = {
    isProfessor,
    isCoordenador,
    isDiretor,
    podeCadastrarAluno,
    podeDeletarAluno,
    podeVerTodosAlunos,
    podeRegistrarFalta,
    podeRegistrarComportamento,
    podeAcessarLaudos,
    podeGerenciarUsuarios,
    getUserPerfil
};
