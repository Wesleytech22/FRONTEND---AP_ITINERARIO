// API Configuration - Conectar com backend
// Altere esta URL para o endereço do seu backend
const API_URL = 'http://localhost:3000'; // Backend rodando nesta porta

class API {
    static async get(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            // Retorna dados mockados para desenvolvimento
            return this.getMockData(endpoint);
        }
    }

    static async post(endpoint, data) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            return { error: error.message };
        }
    }

    static async put(endpoint, data) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            return { error: error.message };
        }
    }

    static async delete(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            return { error: error.message };
        }
    }

    // Dados mockados para desenvolvimento
    static getMockData(endpoint) {
        if (endpoint === '/alunos') {
            return [
                { id: 1, nome: "João Silva", matricula: "2024001", turma: "3º Ano A", responsavel: "Maria Silva", contato: "(11) 99999-1111", created_at: "2026-05-03" },
                { id: 2, nome: "Maria Santos", matricula: "2024002", turma: "3º Ano A", responsavel: "José Santos", contato: "(11) 99999-2222", created_at: "2026-05-03" },
                { id: 3, nome: "Pedro Oliveira", matricula: "2024003", turma: "3º Ano B", responsavel: "Ana Oliveira", contato: "(11) 99999-3333", created_at: "2026-05-03" },
                { id: 4, nome: "Ana Carolina", matricula: "2024004", turma: "3º Ano C", responsavel: "Carlos Souza", contato: "(11) 97777-4444", created_at: "2026-05-03" }
            ];
        }
        return [];
    }
}

// Funções específicas
async function getAlunos() {
    return await API.get('/alunos');
}

async function getAluno(id) {
    const alunos = await API.get('/alunos');
    return alunos.find(a => a.id == id);
}

async function createAluno(aluno) {
    return await API.post('/alunos', aluno);
}

async function updateAluno(id, aluno) {
    return await API.put(`/alunos/${id}`, aluno);
}

async function deleteAluno(id) {
    return await API.delete(`/alunos/${id}`);
}