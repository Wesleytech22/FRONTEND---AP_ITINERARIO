// Dashboard Functions
let dashboardData = {
    totalAlunos: 0,
    alunosRisco: 0,
    turmasCriticas: [],
    alertas: []
};

async function loadDashboard() {
    try {
        const alunos = await getAlunos();

        dashboardData.totalAlunos = alunos.length;
        dashboardData.alunosRisco = alunos.filter((_, index) => index % 3 === 0).length;

        renderDashboard();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        document.getElementById('content-area').innerHTML = '<div class="error">Erro ao carregar dados. Verifique se o backend está rodando.</div>';
    }
}

function renderDashboard() {
    const html = `
        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total de Alunos</span>
                    <span class="stat-card-icon">👨‍🎓</span>
                </div>
                <div class="stat-card-value">${dashboardData.totalAlunos}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Alunos em Risco</span>
                    <span class="stat-card-icon">⚠️</span>
                </div>
                <div class="stat-card-value risk-high">${dashboardData.alunosRisco}</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Taxa de Risco</span>
                    <span class="stat-card-icon">📊</span>
                </div>
                <div class="stat-card-value">${dashboardData.totalAlunos ? Math.round((dashboardData.alunosRisco / dashboardData.totalAlunos) * 100) : 0}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Turmas</span>
                    <span class="stat-card-icon">🏫</span>
                </div>
                <div class="stat-card-value">5</div>
            </div>
        </div>
        
        <!-- Turmas Críticas -->
        <div class="data-table" style="margin-bottom: 1.5rem;">
            <h3 style="padding: 1rem; margin: 0;">🏫 Turmas com Maior Risco</h3>
            <table>
                <thead>
                    <tr><th>Turma</th><th>Alunos em Risco</th><th>Status</th><th>Ação</th></tr>
                </thead>
                <tbody>
                    <tr><td>3º Ano A</td><td>5</td><td><span class="risk-badge alto">Crítico</span></td><td><button class="btn-sm btn-primary" onclick="verTurma('3º Ano A')">Ver Detalhes</button></td></tr>
                    <tr><td>3º Ano B</td><td>3</td><td><span class="risk-badge medio">Atenção</span></td><td><button class="btn-sm btn-primary" onclick="verTurma('3º Ano B')">Ver Detalhes</button></td></tr>
                    <tr><td>2º Ano A</td><td>2</td><td><span class="risk-badge medio">Atenção</span></td><td><button class="btn-sm btn-primary" onclick="verTurma('2º Ano A')">Ver Detalhes</button></td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- Alertas Recentes -->
        <div class="alerts-section">
            <h3>🔔 Alertas Recentes</h3>
            <div class="alert-item critical">
                <strong>⚠️ João Silva - Risco de Evasão</strong><br>
                5 faltas consecutivas neste mês
                <div style="margin-top: 0.5rem;">
                    <button class="btn-sm btn-primary" onclick="verDetalhesAluno(1)">Ver Aluno</button>
                    <button class="btn-sm btn-secondary" onclick="notificarResponsavel(1)">Notificar Responsável</button>
                </div>
            </div>
            <div class="alert-item">
                <strong>📉 Maria Santos - Baixo Desempenho</strong><br>
                Notas abaixo da média em Matemática
                <div style="margin-top: 0.5rem;">
                    <button class="btn-sm btn-primary" onclick="verDetalhesAluno(2)">Ver Aluno</button>
                </div>
            </div>
            <div class="alert-item">
                <strong>⚠️ Pedro Oliveira - Comportamento</strong><br>
                Registro de ocorrências na última semana
                <div style="margin-top: 0.5rem;">
                    <button class="btn-sm btn-primary" onclick="verDetalhesAluno(3)">Ver Aluno</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('content-area').innerHTML = html;
}

function verTurma(turma) {
    alert(`Visualizando detalhes da turma ${turma}`);
}