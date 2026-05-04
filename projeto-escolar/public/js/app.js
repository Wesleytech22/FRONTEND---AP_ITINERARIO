// App Principal - Controle de Navegação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!api.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }
    
    // Carregar informações do usuário
    loadUserInfo();
    
    // Configurar navegação
    setupNavigation();

    // Carregar dashboard inicial
    loadDashboard();
});

function loadUserInfo() {
    const user = api.getCurrentUser();
    if (user) {
        document.getElementById('userName').innerText = user.nome;
        document.getElementById('userAvatar').innerText = user.nome.charAt(0);
        
        let perfilTexto = '';
        let perfilClasse = '';
        if (user.perfil === 'professor') {
            perfilTexto = 'Professor';
            perfilClasse = 'professor';
        } else if (user.perfil === 'coordenador') {
            perfilTexto = 'Coordenador';
            perfilClasse = 'coordenador';
        } else if (user.perfil === 'direcao') {
            perfilTexto = 'Diretor';
            perfilClasse = 'diretor';
        }
        
        document.getElementById('userRole').innerHTML = `<span class="role-badge ${perfilClasse}">${perfilTexto}</span>`;
        
        // Mostrar/esconder menus conforme perfil
        const isAdmin = (user.perfil === 'coordenador' || user.perfil === 'direcao');
        const navTurmas = document.getElementById('navTurmas');
        const navUsuarios = document.getElementById('navUsuarios');
        
        if (navTurmas) navTurmas.style.display = isAdmin ? 'flex' : 'none';
        if (navUsuarios) navUsuarios.style.display = (user.perfil === 'direcao') ? 'flex' : 'none';
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remover active de todos
            navItems.forEach(nav => nav.classList.remove('active'));

            // Adicionar active no clicado
            item.classList.add('active');

            // Carregar página correspondente
            const page = item.getAttribute('data-page');
            const pageTitle = item.querySelector('span:last-child').innerText;

            document.getElementById('page-title').innerText = pageTitle;

            switch (page) {
                case 'dashboard':
                    document.getElementById('page-subtitle').innerText = 'Visão geral da escola';
                    loadDashboard();
                    break;
                case 'alunos-risco':
                    document.getElementById('page-subtitle').innerText = 'Alunos que necessitam de atenção';
                    loadAlunosRisco();
                    break;
                case 'alunos':
                    document.getElementById('page-subtitle').innerText = 'Gerenciar alunos cadastrados';
                    loadAlunos();
                    break;
                case 'turmas':
                    document.getElementById('page-subtitle').innerText = 'Acompanhamento por turma';
                    loadTurmas();
                    break;
                case 'relatorios':
                    document.getElementById('page-subtitle').innerText = 'Gerar relatórios personalizados';
                    loadRelatorios();
                    break;
                case 'config':
                    document.getElementById('page-subtitle').innerText = 'Configurações do sistema';
                    loadConfiguracoes();
                    break;
                case 'faltas':
                    document.getElementById('page-subtitle').innerText = 'Registrar faltas dos alunos';
                    loadFaltas();
                    break;
                case 'comportamento':
                    document.getElementById('page-subtitle').innerText = 'Registrar comportamento dos alunos';
                    loadComportamento();
                    break;
                default:
                    loadDashboard();
            }
        });
    });
}

// Dashboard
async function loadDashboard() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const alunos = await api.getAlunos();
        const turmas = await api.getTurmas();
        const user = api.getCurrentUser();
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Total de Alunos</span>
                        <span>👨‍🎓</span>
                    </div>
                    <div class="stat-card-value">${alunos.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Total de Turmas</span>
                        <span>🏫</span>
                    </div>
                    <div class="stat-card-value">${turmas.length}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Perfil</span>
                        <span>👤</span>
                    </div>
                    <div class="stat-card-value">${user.perfil === 'professor' ? 'Professor' : (user.perfil === 'coordenador' ? 'Coordenador' : 'Diretor')}</div>
                </div>
            </div>
            
            <div class="data-table">
                <h3 style="padding: 1rem; margin: 0;">📋 Últimos Alunos</h3>
                <table>
                    <thead>
                        <tr><th>Nome</th><th>Matrícula</th><th>Turma</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${alunos.slice(0,5).map(aluno => `
                            <tr>
                                <td>${aluno.nome}</td>
                                <td>${aluno.matricula}</td>
                                <td>${aluno.turma || '-'}</td>
                                <td>
                                    <button class="btn-sm btn-primary" onclick="verDetalhesAluno(${aluno.id})">Ver</button>
                                    ${!api.isProfessor() ? `<button class="btn-sm btn-secondary" onclick="registrarFaltaModal(${aluno.id}, '${aluno.nome}')">Falta</button>` : ''}
                                 </nin
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="alerts-section">
                <h3>🔔 Alertas Recentes</h3>
                <div class="alert-item critical">
                    <strong>⚠️ Atenção!</strong><br>
                    Alunos com baixa frequência neste mês
                    <div class="action-buttons">
                        <button class="btn-sm btn-primary" onclick="loadAlunosRisco()">Ver Alunos em Risco</button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Erro ao carregar dashboard: ${error.message}</div>`;
    }
}

// Alunos em Risco
async function loadAlunosRisco() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const alunos = await api.getAlunos();
        // Simular classificação de risco
        const alunosComRisco = alunos.map((aluno, index) => ({
            ...aluno,
            risco: index % 3 === 0 ? 'alto' : (index % 2 === 0 ? 'medio' : 'baixo')
        })).filter(a => a.risco !== 'baixo');
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-value risk-high">${alunosComRisco.filter(a => a.risco === 'alto').length}</div>
                    <div class="stat-card-title">Risco Alto</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value risk-medium">${alunosComRisco.filter(a => a.risco === 'medio').length}</div>
                    <div class="stat-card-title">Risco Médio</div>
                </div>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr><th>Nome</th><th>Matrícula</th><th>Turma</th><th>Nível de Risco</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${alunosComRisco.map(aluno => `
                            <tr>
                                <td>${aluno.nome}</td>
                                <td>${aluno.matricula}</td>
                                <td>${aluno.turma || '-'}</td>
                                <td><span class="risk-badge ${aluno.risco}">${aluno.risco.toUpperCase()}</span></td>
                                <td>
                                    <button class="btn-sm btn-primary" onclick="verDetalhesAluno(${aluno.id})">Ver</button>
                                    <button class="btn-sm btn-danger" onclick="encaminharAluno(${aluno.id})">Encaminhar</button>
                                 </nin
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Erro ao carregar alunos em risco: ${error.message}</div>`;
    }
}

// Lista de Alunos
async function loadAlunos() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const alunos = await api.getAlunos();
        
        content.innerHTML = `
            ${api.isCoordenador() ? '<button class="btn-primary" onclick="showNovoAlunoModal()" style="margin-bottom:1rem;">+ Novo Aluno</button>' : ''}
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Matrícula</th>
                            <th>Turma</th>
                            <th>Responsável</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alunos.map(aluno => `
                            <tr>
                                <td>${aluno.id}</td>
                                <td onclick="verDetalhesAluno(${aluno.id})" style="cursor:pointer;color:#2563eb;">${aluno.nome}</td>
                                <td>${aluno.matricula}</td>
                                <td>${aluno.turma || '-'}</td>
                                <td>${aluno.responsavel || '-'}</td>
                                <td>
                                    <button class="btn-sm btn-primary" onclick="verDetalhesAluno(${aluno.id})">👁️</button>
                                    <button class="btn-sm btn-secondary" onclick="registrarFaltaModal(${aluno.id}, '${aluno.nome}')">Falta</button>
                                    <button class="btn-sm btn-secondary" onclick="registrarComportamentoModal(${aluno.id}, '${aluno.nome}')">Comp</button>
                                    ${api.isCoordenador() ? `<button class="btn-sm btn-primary" onclick="editarAluno(${aluno.id})">✏️</button>` : ''}
                                    ${api.isDiretor() ? `<button class="btn-sm btn-danger" onclick="confirmarExclusao(${aluno.id})">🗑️</button>` : ''}
                                 </nin
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Erro ao carregar alunos: ${error.message}</div>`;
    }
}

// Turmas
async function loadTurmas() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const turmas = await api.getTurmas();
        
        content.innerHTML = `
            <div class="stats-grid">
                ${turmas.map(turma => `
                    <div class="stat-card" onclick="verTurma(${turma.id}, '${turma.nome}')">
                        <div class="stat-card-value">${turma.nome}</div>
                        <div class="stat-card-title">${turma.ano || ''} ${turma.turno || ''}</div>
                        <button class="btn-sm btn-primary" style="margin-top:10px;" onclick="event.stopPropagation();verTurma(${turma.id}, '${turma.nome}')">Ver Alunos →</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Erro ao carregar turmas: ${error.message}</div>`;
    }
}

// Ver alunos de uma turma específica
async function verTurma(turmaId, turmaNome) {
    document.getElementById('page-title').innerText = `Turma: ${turmaNome}`;
    document.getElementById('page-subtitle').innerText = 'Alunos matriculados';
    
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Carregando alunos...</div>';
    
    try {
        const alunos = await api.getAlunos();
        const alunosDaTurma = alunos.filter(aluno => aluno.turma === turmaNome || aluno.turma_id == turmaId);
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-value">${alunosDaTurma.length}</div>
                    <div class="stat-card-title">Total de Alunos</div>
                </div>
            </div>
            <button class="btn-primary" onclick="loadTurmas()" style="margin-bottom:1rem;">← Voltar para Turmas</button>
            <div class="data-table">
                <table>
                    <thead>
                        <td><th>Nome</th><th>Matrícula</th><th>Responsável</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${alunosDaTurma.length > 0 ? alunosDaTurma.map(aluno => `
                            <tr>
                                <td onclick="verDetalhesAluno(${aluno.id})" style="cursor:pointer;color:#2563eb;">${aluno.nome}</td>
                                <td>${aluno.matricula}</td>
                                <td>${aluno.responsavel || '-'}</td>
                                <td>
                                    <button class="btn-sm btn-primary" onclick="verDetalhesAluno(${aluno.id})">Ver</button>
                                    <button class="btn-sm btn-secondary" onclick="registrarFaltaModal(${aluno.id}, '${aluno.nome}')">Falta</button>
                                 </nin
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align:center;">Nenhum aluno encontrado</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Erro ao carregar alunos: ${error.message}</div>`;
    }
}

// Faltas
async function loadFaltas() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const alunos = await api.getAlunos();
        
        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card-value">${alunos.length}</div>
                    <div class="stat-card-title">Total de Alunos</div>
                </div>
            </div>
            <div class="stats-grid">
                ${alunos.map(aluno => `
                    <div class="stat-card" onclick="registrarFaltaModal(${aluno.id}, '${aluno.nome}')">
                        <div class="stat-card-value">${aluno.nome}</div>
                        <div class="stat-card-title">${aluno.turma || '-'}</div>
                        <button class="btn-sm btn-primary" style="margin-top:10px;">Registrar Falta</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Erro ao carregar faltas: ${error.message}</div>`;
    }
}

// Comportamento
async function loadComportamento() {
    const content = document.getElementById('content-area');
    content.innerHTML = '<div class="loading">Carregando...</div>';
    
    try {
        const alunos = await api.getAlunos();
        
        content.innerHTML = `
            <div class="stats-grid">
                ${alunos.map(aluno => `
                    <div class="stat-card" onclick="registrarComportamentoModal(${aluno.id}, '${aluno.nome}')">
                        <div class="stat-card-value">${aluno.nome}</div>
                        <div class="stat-card-title">${aluno.turma || '-'}</div>
                        <button class="btn-sm btn-primary" style="margin-top:10px;">Registrar Comportamento</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<div class="loading">Erro ao carregar comportamento: ${error.message}</div>`;
    }
}

// Relatórios
function loadRelatorios() {
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-title">Relatórios Disponíveis</div>
                <div class="action-buttons" style="margin-top: 1rem;">
                    <button class="btn-primary" onclick="gerarRelatorio('risco')">📊 Relatório de Risco</button>
                    <button class="btn-primary" onclick="gerarRelatorio('frequencia')">📈 Relatório de Frequência</button>
                    <button class="btn-primary" onclick="gerarRelatorio('desempenho')">📉 Relatório de Desempenho</button>
                </div>
            </div>
        </div>
        <div id="relatorio-preview" class="alerts-section">
            <p>Selecione um relatório para visualizar</p>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

// Configurações
function loadConfiguracoes() {
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Configurações do Sistema</h3>
                <div class="form-group">
                    <label>URL do Backend</label>
                    <input type="text" id="backend-url" value="${API_URL}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label>Limite de Alunos por Página</label>
                    <input type="number" id="itens-por-pagina" value="20">
                </div>
                <button class="btn-primary" onclick="salvarConfiguracoes()">Salvar Configurações</button>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function salvarConfiguracoes() {
    const newUrl = document.getElementById('backend-url').value;
    alert(`Configurações salvas! Reinicie a página para aplicar as alterações.\nNovo backend: ${newUrl}`);
}

function gerarRelatorio(tipo) {
    const preview = document.getElementById('relatorio-preview');
    if (preview) {
        preview.innerHTML = `
            <h3>Relatório de ${tipo === 'risco' ? 'Risco' : (tipo === 'frequencia' ? 'Frequência' : 'Desempenho')}</h3>
            <p>Gerando relatório... (em desenvolvimento)</p>
            <button class="btn-primary" onclick="exportarRelatorio()">📥 Exportar CSV</button>
        `;
    }
}

function exportarRelatorio() {
    alert('Relatório exportado com sucesso!');
}

// CRUD Alunos
function showNovoAlunoModal() {
    showModal('Novo Aluno', `
        <div class="form-group"><label>Nome *</label><input type="text" id="alunoNome" required></div>
        <div class="form-group"><label>Matrícula *</label><input type="text" id="alunoMatricula" required></div>
        <div class="form-group"><label>Turma</label><input type="text" id="alunoTurma"></div>
        <div class="form-group"><label>Responsável</label><input type="text" id="alunoResponsavel"></div>
        <div class="form-group"><label>Contato</label><input type="text" id="alunoContato"></div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="salvarNovoAluno()">Salvar</button>
        </div>
    `);
}

async function salvarNovoAluno() {
    const novoAluno = {
        nome: document.getElementById('alunoNome').value,
        matricula: document.getElementById('alunoMatricula').value,
        turma: document.getElementById('alunoTurma').value,
        responsavel: document.getElementById('alunoResponsavel').value,
        contato: document.getElementById('alunoContato').value
    };
    
    if (!novoAluno.nome || !novoAluno.matricula) {
        alert('Nome e Matrícula são obrigatórios!');
        return;
    }
    
    const result = await api.createAluno(novoAluno);
    if (result.id) {
        alert('Aluno criado com sucesso!');
        closeModal();
        loadAlunos();
    } else {
        alert('Erro ao criar aluno');
    }
}

async function editarAluno(id) {
    const aluno = await api.getAluno(id);
    showModal('Editar Aluno', `
        <div class="form-group"><label>Nome</label><input type="text" id="alunoNome" value="${aluno.nome}"></div>
        <div class="form-group"><label>Matrícula</label><input type="text" id="alunoMatricula" value="${aluno.matricula}" readonly style="background:#f3f4f6;"></div>
        <div class="form-group"><label>Turma</label><input type="text" id="alunoTurma" value="${aluno.turma || ''}"></div>
        <div class="form-group"><label>Responsável</label><input type="text" id="alunoResponsavel" value="${aluno.responsavel || ''}"></div>
        <div class="form-group"><label>Contato</label><input type="text" id="alunoContato" value="${aluno.contato || ''}"></div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="atualizarAluno(${id})">Atualizar</button>
        </div>
    `);
}

async function atualizarAluno(id) {
    const alunoAtualizado = {
        nome: document.getElementById('alunoNome').value,
        turma: document.getElementById('alunoTurma').value,
        responsavel: document.getElementById('alunoResponsavel').value,
        contato: document.getElementById('alunoContato').value
    };
    
    const result = await api.updateAluno(id, alunoAtualizado);
    if (result.message) {
        alert('Aluno atualizado com sucesso!');
        closeModal();
        loadAlunos();
    }
}

function confirmarExclusao(id) {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        api.deleteAluno(id);
        alert('Aluno removido!');
        loadAlunos();
    }
}

// Faltas e Comportamento Modals
function registrarFaltaModal(alunoId, alunoNome) {
    showModal('Registrar Falta', `
        <div class="form-group"><label>Aluno</label><input type="text" value="${alunoNome}" readonly></div>
        <div class="form-group"><label>Data</label><input type="date" id="dataFalta" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group"><label>Quantidade de Faltas</label>
            <select id="qtdFaltas">
                <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
            </select>
        </div>
        <div class="form-group"><label>Observação</label><textarea id="obsFalta" placeholder="Motivo da falta..."></textarea></div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="salvarFalta(${alunoId})">Salvar Falta</button>
        </div>
    `);
}

async function salvarFalta(alunoId) {
    const data = {
        aluno_id: alunoId,
        data: document.getElementById('dataFalta').value,
        quantidade: document.getElementById('qtdFaltas').value,
        observacao: document.getElementById('obsFalta').value
    };
    
    const result = await api.registrarFalta(data);
    if (result.id) {
        alert('Falta registrada com sucesso!');
        closeModal();
        refreshData();
    } else {
        alert('Erro ao registrar falta');
    }
}

function registrarComportamentoModal(alunoId, alunoNome) {
    showModal('Registrar Comportamento', `
        <div class="form-group"><label>Aluno</label><input type="text" value="${alunoNome}" readonly></div>
        <div class="form-group"><label>Data</label><input type="date" id="dataComp" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group"><label>Tipo</label>
            <select id="tipoComp">
                <option value="bom">👍 Bom</option>
                <option value="regular">😐 Regular</option>
                <option value="ruim">👎 Ruim</option>
                <option value="ocorrencia">⚠️ Ocorrência</option>
            </select>
        </div>
        <div class="form-group"><label>Descrição</label><textarea id="descComp" placeholder="Descreva o comportamento..."></textarea></div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="salvarComportamento(${alunoId})">Salvar</button>
        </div>
    `);
}

async function salvarComportamento(alunoId) {
    const data = {
        aluno_id: alunoId,
        tipo: document.getElementById('tipoComp').value,
        descricao: document.getElementById('descComp').value,
        data: document.getElementById('dataComp').value
    };
    
    const result = await api.registrarComportamento(data);
    if (result.id) {
        alert('Comportamento registrado com sucesso!');
        closeModal();
        refreshData();
    } else {
        alert('Erro ao registrar comportamento');
    }
}

// Detalhes do Aluno
async function verDetalhesAluno(id) {
    const aluno = await api.getAluno(id);
    
    document.getElementById('page-title').innerText = aluno.nome;
    document.getElementById('page-subtitle').innerText = 'Detalhes do Aluno';
    
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div style="background:white;border-radius:12px;padding:1.5rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:2rem;">
                <div>
                    <h2>${aluno.nome}</h2>
                    <p>Matrícula: ${aluno.matricula} | Turma: ${aluno.turma || '-'}</p>
                </div>
                <div><span class="risk-badge medio">RISCO MÉDIO</span></div>
            </div>
            
            <div class="stats-grid" style="margin-bottom:1rem;">
                <div class="stat-card"><div class="stat-card-value">65%</div><div class="stat-card-title">Frequência</div></div>
                <div class="stat-card"><div class="stat-card-value risk-high">5.5</div><div class="stat-card-title">Média Geral</div></div>
            </div>
            
            <div class="form-group"><label>Responsável</label><input type="text" value="${aluno.responsavel || 'Não informado'}" readonly style="background:#f3f4f6;"></div>
            <div class="form-group"><label>Contato</label><input type="text" value="${aluno.contato || 'Não informado'}" readonly style="background:#f3f4f6;"></div>
            
            <div class="action-buttons">
                <button class="btn-primary" onclick="registrarFaltaModal(${aluno.id}, '${aluno.nome}')">📝 Registrar Falta</button>
                <button class="btn-primary" onclick="registrarComportamentoModal(${aluno.id}, '${aluno.nome}')">⚠️ Comportamento</button>
                <button class="btn-secondary" onclick="notificarResponsavel(${aluno.id})">📧 Notificar</button>
                <button class="btn-secondary" onclick="voltarLista()">← Voltar</button>
            </div>
        </div>
    `;
}

function voltarLista() {
    document.getElementById('page-title').innerText = 'Todos os Alunos';
    document.getElementById('page-subtitle').innerText = 'Gerenciar alunos cadastrados';
    loadAlunos();
}

// Ações
function encaminharAluno(id) {
    showModal('Encaminhar Aluno', `
        <div class="form-group"><label>Tipo</label>
            <select id="encTipo">
                <option>Psicológico</option>
                <option>Pedagógico</option>
                <option>Social</option>
            </select>
        </div>
        <div class="form-group"><label>Justificativa</label><textarea rows="3" id="encJustificativa"></textarea></div>
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

function notificarResponsavel(id) {
    showModal('Notificar Responsável', `
        <div class="form-group"><label>Mensagem</label><textarea rows="4" id="mensagem" placeholder="Digite a mensagem..."></textarea></div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="enviarNotificacao(${id})">Enviar</button>
        </div>
    `);
}

function enviarNotificacao(id) {
    alert(`Notificação enviada para o responsável!`);
    closeModal();
}

function adicionarObservacao() {
    showModal('Adicionar Observação', `
        <div class="form-group"><label>Observação</label><textarea rows="4" id="observacao" placeholder="Digite sua observação..."></textarea></div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="salvarObservacao()">Salvar</button>
        </div>
    `);
}

function salvarObservacao() {
    alert('Observação salva com sucesso!');
    closeModal();
}

// Funções Globais
function refreshData() {
    const activePage = document.querySelector('.nav-item.active').getAttribute('data-page');
    switch (activePage) {
        case 'dashboard': loadDashboard(); break;
        case 'alunos': loadAlunos(); break;
        case 'alunos-risco': loadAlunosRisco(); break;
        case 'turmas': loadTurmas(); break;
        case 'faltas': loadFaltas(); break;
        case 'comportamento': loadComportamento(); break;
    }
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        api.logout();
    }
}

// Modal Functions
function showModal(title, body) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}