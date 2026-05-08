// Lista de Alunos
let currentPage = 'lista';
let allAlunos = [];

async function loadAlunos() {
    try {
        allAlunos = await getAlunos();
        renderAlunosList(allAlunos);
    } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        document.getElementById('content-area').innerHTML = '<div class="error">Erro ao carregar lista de alunos</div>';
    }
}

async function loadAlunosRisco() {
    try {
        const alunos = await getAlunos();
        // Simular classificação de risco
        const alunosComRisco = alunos.map((aluno, index) => ({
            ...aluno,
            risco: index % 3 === 0 ? 'alto' : (index % 2 === 0 ? 'medio' : 'baixo'),
            fatores: index % 3 === 0 ? ['Faltas', 'Notas baixas'] : (index % 2 === 0 ? ['Atrasos'] : ['Participação']),
            ultimaAtualizacao: new Date().toLocaleDateString()
        })).filter(a => a.risco === 'alto' || a.risco === 'medio');

        renderAlunosRiscoList(alunosComRisco);
    } catch (error) {
        console.error('Erro ao carregar alunos em risco:', error);
    }
}

function renderAlunosList(alunos) {
    const html = `
        <div style="margin-bottom: 1rem;">
            <button class="btn-primary" onclick="showNovoAlunoModal()">+ Novo Aluno</button>
            <input type="text" id="search-aluno" placeholder="Buscar aluno..." class="filter-select" style="margin-left: 1rem; width: 300px;" onkeyup="buscarAluno()">
        </div>
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Matrícula</th>
                        <th>Turma</th>
                        <th>Responsável</th>
                        <th>Contato</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${alunos.map(aluno => `
                        <tr>
                            <td>${aluno.id}</td>
                            <td onclick="verDetalhesAluno(${aluno.id})" style="cursor: pointer; color: var(--primary);">${aluno.nome}</td>
                            <td>${aluno.matricula}</td>
                            <td>${aluno.turma || '-'}</td>
                            <td>${aluno.responsavel || '-'}</td>
                            <td>${aluno.contato || '-'}</td>
                            <td>
                                <button class="btn-sm btn-primary" onclick="event.stopPropagation();editarAluno(${aluno.id})">✏️</button>
                                <button class="btn-sm btn-danger" onclick="event.stopPropagation();confirmarExclusao(${aluno.id})">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('content-area').innerHTML = html;
}

function renderAlunosRiscoList(alunos) {
    const html = `
        <div class="stats-grid" style="margin-bottom: 1rem;">
            <div class="stat-card">
                <div class="stat-card-value risk-high">${alunos.filter(a => a.risco === 'alto').length}</div>
                <div class="stat-card-title">Risco Alto</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value risk-medium">${alunos.filter(a => a.risco === 'medio').length}</div>
                <div class="stat-card-title">Risco Médio</div>
            </div>
        </div>
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Matrícula</th>
                        <th>Turma</th>
                        <th>Nível de Risco</th>
                        <th>Fatores</th>
                        <th>Última Atualização</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${alunos.map(aluno => `
                        <tr>
                            <td onclick="verDetalhesAluno(${aluno.id})" style="cursor: pointer; color: var(--primary);">${aluno.nome}</td>
                            <td>${aluno.matricula}</td>
                            <td>${aluno.turma}</td>
                            <td><span class="risk-badge ${aluno.risco}">${aluno.risco.toUpperCase()}</span></td>
                            <td>${aluno.fatores.join(', ')}</td>
                            <td>${aluno.ultimaAtualizacao}</td>
                            <td>
                                <button class="btn-sm btn-primary" onclick="encaminharAluno(${aluno.id})">Encaminhar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('content-area').innerHTML = html;
}

function buscarAluno() {
    const searchTerm = document.getElementById('search-aluno').value.toLowerCase();
    const filtered = allAlunos.filter(a =>
        a.nome.toLowerCase().includes(searchTerm) ||
        a.matricula.includes(searchTerm)
    );
    renderAlunosList(filtered);
}

function showNovoAlunoModal() {
    showModal('Novo Aluno', `
        <div class="form-group">
            <label>Nome Completo *</label>
            <input type="text" id="aluno-nome" required>
        </div>
        <div class="form-group">
            <label>Matrícula *</label>
            <input type="text" id="aluno-matricula" required>
        </div>
        <div class="form-group">
            <label>Turma</label>
            <input type="text" id="aluno-turma">
        </div>
        <div class="form-group">
            <label>Responsável</label>
            <input type="text" id="aluno-responsavel">
        </div>
        <div class="form-group">
            <label>Contato</label>
            <input type="text" id="aluno-contato">
        </div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="salvarNovoAluno()">Salvar</button>
        </div>
    `);
}

async function salvarNovoAluno() {
    const novoAluno = {
        nome: document.getElementById('aluno-nome').value,
        matricula: document.getElementById('aluno-matricula').value,
        turma: document.getElementById('aluno-turma').value,
        responsavel: document.getElementById('aluno-responsavel').value,
        contato: document.getElementById('aluno-contato').value
    };

    if (!novoAluno.nome || !novoAluno.matricula) {
        alert('Nome e Matrícula são obrigatórios!');
        return;
    }

    const result = await createAluno(novoAluno);
    if (result.id) {
        alert('Aluno criado com sucesso!');
        closeModal();
        loadAlunos();
    } else {
        alert('Erro ao criar aluno');
    }
}

function editarAluno(id) {
    const aluno = allAlunos.find(a => a.id === id);
    if (aluno) {
        showModal('Editar Aluno', `
            <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" id="aluno-nome" value="${aluno.nome}">
            </div>
            <div class="form-group">
                <label>Turma</label>
                <input type="text" id="aluno-turma" value="${aluno.turma || ''}">
            </div>
            <div class="form-group">
                <label>Responsável</label>
                <input type="text" id="aluno-responsavel" value="${aluno.responsavel || ''}">
            </div>
            <div class="form-group">
                <label>Contato</label>
                <input type="text" id="aluno-contato" value="${aluno.contato || ''}">
            </div>
            <div class="form-actions">
                <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn-primary" onclick="atualizarAluno(${id})">Atualizar</button>
            </div>
        `);
    }
}

async function atualizarAluno(id) {
    const alunoAtualizado = {
        nome: document.getElementById('aluno-nome').value,
        turma: document.getElementById('aluno-turma').value,
        responsavel: document.getElementById('aluno-responsavel').value,
        contato: document.getElementById('aluno-contato').value
    };

    const result = await updateAluno(id, alunoAtualizado);
    if (result.message) {
        alert('Aluno atualizado com sucesso!');
        closeModal();
        loadAlunos();
    }
}

function confirmarExclusao(id) {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        deleteAluno(id);
        alert('Aluno removido!');
        loadAlunos();
    }
}

function encaminharAluno(id) {
    showModal('Encaminhar Aluno', `
        <div class="form-group">
            <label>Tipo de Encaminhamento</label>
            <select id="encaminhamento-tipo">
                <option>Psicológico</option>
                <option>Pedagógico</option>
                <option>Social</option>
                <option>Orientação</option>
            </select>
        </div>
        <div class="form-group">
            <label>Justificativa</label>
            <textarea rows="3" id="justificativa" placeholder="Descreva o motivo do encaminhamento..."></textarea>
        </div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="confirmarEncaminhamento(${id})">Confirmar</button>
        </div>
    `);
}

function confirmarEncaminhamento(id) {
    alert(`Aluno encaminhado com sucesso!`);
    closeModal();
}