// App Principal - Controle de Navegação
document.addEventListener('DOMContentLoaded', () => {
    // Configurar navegação
    setupNavigation();

    // Carregar dashboard inicial
    loadDashboard();
});

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
                default:
                    loadDashboard();
            }
        });
    });
}

function loadTurmas() {
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-value">8</div>
                <div class="stat-card-title">Total de Turmas</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value risk-high">2</div>
                <div class="stat-card-title">Turmas Críticas</div>
            </div>
        </div>
        <div class="data-table">
            <table>
                <thead>
                    <tr><th>Turma</th><th>Total Alunos</th><th>Alunos em Risco</th><th>Taxa de Risco</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>3º Ano A</td><td>35</td><td class="risk-high">12</td><td>34%</td><td><span class="risk-badge alto">CRÍTICO</span></td></tr>
                    <tr><td>3º Ano B</td><td>32</td><td class="risk-medium">8</td><td>25%</td><td><span class="risk-badge medio">ATENÇÃO</span></td></tr>
                    <tr><td>3º Ano C</td><td>33</td><td>5</td><td>15%</td><td><span class="risk-badge baixo">NORMAL</span></td></tr>
                    <tr><td>2º Ano A</td><td>30</td><td class="risk-medium">9</td><td>30%</td><td><span class="risk-badge medio">ATENÇÃO</span></td></tr>
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

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

// Funções Globais
function refreshData() {
    const activePage = document.querySelector('.nav-item.active').getAttribute('data-page');
    switch (activePage) {
        case 'dashboard': loadDashboard(); break;
        case 'alunos': loadAlunos(); break;
        case 'alunos-risco': loadAlunosRisco(); break;
    }
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        alert('Saindo do sistema...');
        // Redirecionar para login
    }
}

function verDetalhesAluno(id) {
    loadAlunoDetalhe(id);
}

function notificarResponsavel(id) {
    showModal('Notificar Responsável', `
        <div class="form-group">
            <label>Mensagem</label>
            <textarea rows="4" id="mensagem" placeholder="Digite a mensagem para o responsável..."></textarea>
        </div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn-primary" onclick="enviarNotificacao(${id})">Enviar</button>
        </div>
    `);
}

function enviarNotificacao(id) {
    alert(`Notificação enviada para o responsável do aluno ${id}`);
    closeModal();
}

function adicionarObservacao() {
    showModal('Adicionar Observação', `
        <div class="form-group">
            <label>Observação</label>
            <textarea rows="4" id="observacao" placeholder="Digite sua observação..."></textarea>
        </div>
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

// Modal Functions
function showModal(title, body) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}