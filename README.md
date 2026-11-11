# 🌱 EcoTrack

**Sistema Web para Consulta e Gerenciamento de Pontos de Coleta Seletiva**

## 1. Sobre o projeto

O EcoTrack é uma plataforma web desenvolvida com o objetivo de facilitar a localização de pontos de coleta seletiva e incentivar o descarte correto de materiais recicláveis.

O sistema permite que os usuários consultem locais de coleta, visualizem seus endereços, horários de funcionamento e materiais recebidos. Além disso, administradores podem cadastrar, editar e excluir pontos de coleta.

## 2. Problema identificado e justificativa

O descarte inadequado de materiais recicláveis é um problema que afeta diversas comunidades. Muitas pessoas têm interesse em realizar a separação correta dos resíduos, mas encontram dificuldades para localizar pontos de coleta seletiva próximos de suas residências ou descobrir quais materiais cada local recebe.

Esse problema afeta moradores, estudantes, famílias e pessoas que desejam contribuir com a preservação ambiental. A falta de informações acessíveis pode fazer com que materiais recicláveis sejam descartados junto ao lixo comum, aumentando a quantidade de resíduos enviados aos aterros sanitários e dificultando o reaproveitamento de recursos.

Diante dessa situação, surgiu a proposta do EcoTrack, uma plataforma web que reúne informações sobre pontos de coleta seletiva, permitindo consultar endereços, materiais recebidos, horários de funcionamento e observações importantes.

O objetivo é facilitar o acesso a essas informações, incentivar práticas sustentáveis e contribuir para a destinação correta dos resíduos recicláveis.

## 3. Objetivos do sistema

### Objetivo geral

Desenvolver um sistema web que facilite a localização e a consulta de pontos de coleta seletiva, contribuindo para o descarte adequado de materiais recicláveis.

### Objetivos específicos

- Reunir informações sobre pontos de coleta seletiva.
- Permitir a consulta de endereços e horários de funcionamento.
- Informar quais materiais são recebidos em cada local.
- Facilitar a pesquisa de pontos de coleta.
- Permitir que administradores gerenciem os locais cadastrados.
- Proteger o acesso às funcionalidades por meio de autenticação e controle de permissões.

## 4. Tipos de usuários e permissões

O EcoTrack possui dois perfis de acesso:

### Usuário comum

- Realizar cadastro e login.
- Consultar pontos de coleta.
- Pesquisar locais pelo nome ou endereço.
- Filtrar pontos conforme os materiais recebidos.
- Visualizar informações dos pontos cadastrados.
- Consultar e atualizar os dados da própria conta.

### Administrador

- Realizar login com uma conta administrativa.
- Consultar pontos de coleta.
- Cadastrar novos pontos.
- Editar informações dos pontos existentes.
- Excluir pontos de coleta.
- Consultar e atualizar os dados da própria conta.

As permissões administrativas são verificadas diretamente no back-end, utilizando autenticação JWT e middleware de autorização.

## 5. Fluxo de funcionamento do sistema

### Fluxo do usuário comum

1. O usuário acessa a página inicial do EcoTrack.
2. Realiza seu cadastro informando nome, e-mail e senha.
3. Faz login utilizando suas credenciais.
4. Após a autenticação, acessa os pontos de coleta disponíveis.
5. Pesquisa locais pelo nome ou endereço.
6. Utiliza os filtros para encontrar pontos que recebem determinados materiais.
7. Consulta os detalhes, endereços, horários e observações dos locais.

### Fluxo do administrador

1. O administrador acessa o sistema.
2. Realiza login com uma conta que possui perfil administrativo.
3. Acessa os pontos de coleta cadastrados.
4. Pode cadastrar novos pontos de coleta.
5. Pode editar informações de pontos existentes.
6. Pode excluir pontos que não precisam mais aparecer na plataforma.

Todas as operações administrativas passam pela API, que verifica a autenticidade do token e o nível de acesso do usuário antes de permitir alterações.

## 6. Funcionalidades principais

- Cadastro de usuários.
- Login e autenticação.
- Proteção de senhas com bcrypt.
- Autenticação por JWT.
- Controle de acesso por perfil.
- Consulta de pontos de coleta.
- Pesquisa por nome e endereço.
- Filtro por materiais recebidos.
- Cadastro de pontos de coleta.
- Edição de pontos de coleta.
- Exclusão de pontos de coleta.
- Atualização dos dados da própria conta.

## 7. Tecnologias utilizadas

### Front-end
- HTML5
- CSS3
- JavaScript
- Fetch API
- Manipulação do DOM

### Back-end
- Node.js
- Express
- API REST
- JSON Web Token (JWT)
- bcryptjs
- dotenv
- CORS

### Banco de dados
- MySQL
- mysql2

### Organização e versionamento
- Git
- GitHub

## 8. Estrutura do projeto

```text
ecotrack/
│
├── README.md
│
└── projeto/
    │
    ├── frontend/
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    │
    ├── backend/
    │   ├── .env.example
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── server.js
    │   │
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   └── pontosRoutes.js
    │   │
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   └── pontosController.js
    │   │
    │   ├── middlewares/
    │   │   └── autenticacao.js
    │   │
    │   └── database/
    │       └── conexao.js
    │
    ├── sql/
    │   └── ecotrack.sql
    │
    └── .gitignore
```

## 9. Banco de dados

O sistema utiliza MySQL como banco de dados relacional, com duas tabelas principais:

### Tabela usuarios

Armazena as informações dos usuários cadastrados.

Principais campos:
- id: identificador do usuário.
- nome: nome do usuário.
- email: endereço de e-mail, com restrição de unicidade.
- senha: senha armazenada em formato de hash.
- perfil: nível de acesso do usuário (usuario ou admin).
- criado_em: data de criação da conta.

### Tabela pontos_coleta

Armazena as informações dos locais de coleta seletiva.

Principais campos:
- id: identificador do ponto de coleta.
- nome: nome do local.
- endereco: endereço do ponto de coleta.
- materiais: materiais recebidos.
- horario: horário de funcionamento.
- observacoes: informações adicionais.
- criado_por: usuário responsável pelo cadastro.
- criado_em: data de criação do registro.
- atualizado_em: data da última atualização.

### Relacionamento

A tabela pontos_coleta possui uma chave estrangeira chamada criado_por, relacionada ao campo id da tabela usuarios.

Esse relacionamento permite identificar qual usuário realizou o cadastro de cada ponto de coleta.

O script responsável pela criação do banco de dados está disponível em:

`projeto/sql/ecotrack.sql`

## 10. Autenticação e segurança

O EcoTrack utiliza autenticação baseada em JWT (JSON Web Token).

Após realizar o login corretamente, o sistema gera um token com validade de quatro horas, contendo a identificação e o perfil do usuário.

O middleware de autenticação verifica o token enviado nas requisições protegidas.

O controle de permissões funciona da seguinte maneira:

- Usuários autenticados podem consultar os pontos de coleta.
- Apenas administradores podem cadastrar, editar e excluir pontos.
- Requisições sem token válido são bloqueadas.
- Usuários sem permissão administrativa recebem resposta HTTP 403 ao tentar realizar operações administrativas.

As senhas são protegidas utilizando bcryptjs, e as consultas ao banco utilizam parâmetros para evitar a inserção direta de dados nas instruções SQL.

## 11. Rotas principais da API

### Autenticação e conta

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/registrar` | Cadastrar usuário |
| POST | `/api/auth/login` | Realizar login |
| GET | `/api/auth/minha-conta` | Consultar dados da conta |
| PUT | `/api/auth/minha-conta` | Atualizar dados da conta |

### Pontos de coleta

| Método | Rota | Permissão |
|---|---|---|
| GET | `/api/pontos` | Usuário autenticado |
| GET | `/api/pontos/:id` | Usuário autenticado |
| POST | `/api/pontos` | Administrador |
| PUT | `/api/pontos/:id` | Administrador |
| DELETE | `/api/pontos/:id` | Administrador |

### Verificação da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Verificar se a API está funcionando |

## 12. Instalação e execução

### Pré-requisitos

Antes de executar o projeto, é necessário possuir:

- Node.js instalado.
- MySQL instalado e funcionando.
- MySQL Workbench ou outro cliente MySQL.
- Navegador web.

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/DaviGomesx/ecotrack.git
```

Entre na pasta do projeto:

```bash
cd ecotrack
```

### Passo 2 — Configurar o banco de dados

Abra o MySQL Workbench e execute o script:

`projeto/sql/ecotrack.sql`

Esse arquivo cria o banco de dados EcoTrack, as tabelas necessárias e registros iniciais de demonstração.

### Passo 3 — Instalar as dependências

A partir da raiz do repositório, entre na pasta do back-end:

```bash
cd projeto/backend
```

Instale as dependências:

```bash
npm install
```

### Passo 4 — Configurar as variáveis de ambiente

Crie uma cópia do arquivo `.env.example` com o nome `.env`.

No terminal, execute:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure os dados de conexão com o MySQL e a chave JWT.

Exemplo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=ecotrack
JWT_SECRET=sua_chave_secreta
```

Substitua os valores pelos dados da sua instalação local.

### Passo 5 — Iniciar o back-end

Ainda dentro da pasta `projeto/backend`, execute:

```bash
npm start
```

A API ficará disponível em:

`http://localhost:3000`

Para verificar se está funcionando, acesse:

`http://localhost:3000/api/health`

### Passo 6 — Abrir o front-end

Abra o arquivo abaixo no navegador:

`projeto/frontend/index.html`

Com o servidor e o banco de dados funcionando, será possível utilizar o sistema.

## 13. Como testar o sistema

### Teste de cadastro e login

1. Abra o front-end.
2. Cadastre um novo usuário.
3. Verifique se o cadastro foi realizado.
4. Faça login com o e-mail e a senha cadastrados.
5. Teste também uma senha incorreta.

### Teste de permissões administrativas

Para testar as funcionalidades de administrador, primeiro registre uma conta normalmente.

Depois, execute no MySQL:

```sql
UPDATE usuarios
SET perfil = 'admin'
WHERE email = 'SEU_EMAIL';
```

Substitua `SEU_EMAIL` pelo endereço utilizado no cadastro.

Em seguida, faça login novamente para receber um token com o perfil atualizado.

### Teste do CRUD

Com a conta administrativa, teste:

- Cadastro de um ponto de coleta.
- Consulta dos pontos cadastrados.
- Edição de um ponto existente.
- Exclusão de um ponto.

Também é possível verificar o bloqueio das operações administrativas utilizando uma conta de usuário comum.

## 14. Segurança e cuidados

- O arquivo `.env` não deve ser enviado ao GitHub.
- Não devem ser compartilhadas senhas ou credenciais privadas.
- A pasta `node_modules` não deve ser versionada.
- O arquivo `.env.example` deve conter apenas valores ilustrativos.
- As permissões são verificadas no back-end, e não somente na interface.

## 15. Desenvolvimento e versionamento

O desenvolvimento do EcoTrack é realizado em um único repositório no GitHub:

https://github.com/DaviGomesx/ecotrack

O histórico de commits é utilizado para registrar as alterações, melhorias e evolução do sistema durante as etapas do Projeto Web.

---

**EcoTrack — Facilitando a localização de pontos de coleta e incentivando o descarte correto de materiais recicláveis.** 🌱