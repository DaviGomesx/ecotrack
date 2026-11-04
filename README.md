# EcoTrack

Sistema web para ajudar a comunidade a encontrar pontos de coleta seletiva e organizar informações sobre reciclagem.

## Problema e solução
Muitas pessoas não sabem onde descartar corretamente materiais recicláveis. O EcoTrack reúne pontos de coleta em uma lista simples e permite que usuários consultem os locais. Usuários comuns podem consultar; administradores podem cadastrar, editar e excluir pontos.

## Perfis
- **Usuário:** cria conta, entra no sistema e consulta os pontos.
- **Administrador:** além de consultar, pode criar, editar e excluir pontos de coleta. A permissão é validada na API.

## Tecnologias
HTML, CSS, JavaScript (Fetch e DOM), Node.js, Express, MySQL, API REST, JWT e bcrypt.

## Estrutura
- `frontend/`: interface web
- `backend/routes/`: rotas da API
- `backend/controllers/`: lógica das rotas
- `backend/middlewares/`: autenticação e autorização
- `backend/database/`: conexão MySQL
- `sql/ecotrack.sql`: criação do banco e tabelas

## Como executar
1. Abra o MySQL Workbench e execute `sql/ecotrack.sql`.
2. Entre na pasta `backend` e execute `npm install`.
3. Copie `.env.example` para `.env` e preencha as credenciais do seu MySQL.
4. Para criar a primeira conta administradora, registre uma conta normal e depois execute no MySQL: `UPDATE usuarios SET perfil = 'admin' WHERE email = 'SEU_EMAIL';`
5. Na pasta `backend`, execute `npm start`.
6. Abra `frontend/index.html` no navegador. A API usa `http://localhost:3000`.

> Não envie `.env`, senhas ou `node_modules` para o GitHub.

## Rotas principais
- `POST /api/auth/registrar` — criar conta
- `POST /api/auth/login` — entrar e receber token
- `GET /api/pontos` — listar pontos (login necessário)
- `GET /api/pontos/:id` — consultar ponto (login necessário)
- `POST /api/pontos` — criar ponto (admin)
- `PUT /api/pontos/:id` — atualizar ponto (admin)
- `DELETE /api/pontos/:id` — excluir ponto (admin)
- `GET /api/health` — verificar se a API está ativa

## Teste
Registre um usuário pela interface, faça login e consulte os pontos. Para testar o CRUD completo, altere seu perfil para `admin` com o comando SQL acima e entre novamente.

## ATUALIZAÇÕES FUTURAS
Aplicação de novas funções de filtragem nos pontos!
