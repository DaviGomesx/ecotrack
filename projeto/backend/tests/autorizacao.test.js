// Testes de autorização entre perfis e de operações sobre registros de outros usuários.
// O MySQL é substituído por um banco em memória (pool.query simulado), então
// os testes rodam sem banco: npm test
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "segredo_de_teste";

const { pool } = await import("../database/conexao.js");
const { default: app } = await import("../app.js");

// ---- "banco" em memória ----
const usuarios = new Map([
    [1, { id: 1, nome: "Admin", email: "admin@t.com", perfil: "admin" }],
    [2, { id: 2, nome: "Ana", email: "ana@t.com", perfil: "usuario" }],
    [3, { id: 3, nome: "Beto", email: "beto@t.com", perfil: "usuario" }]
]);
let solicitacoes = [];

pool.query = async (sql, params = []) => {
    const q = sql.replace(/\s+/g, " ").trim();
    if (q.startsWith("SELECT id, nome, email, perfil FROM usuarios WHERE id")) {
        const u = usuarios.get(Number(params[0]));
        return [u ? [{ ...u }] : []];
    }
    if (q.startsWith("DELETE FROM solicitacoes_pontos WHERE id = ? AND usuario_id = ?")) {
        const antes = solicitacoes.length;
        solicitacoes = solicitacoes.filter(
            s => !(s.id === Number(params[0]) && s.usuario_id === Number(params[1]))
        );
        return [{ affectedRows: antes - solicitacoes.length }];
    }
    if (q.startsWith("SELECT id, nome_ponto") && q.includes("WHERE usuario_id = ?")) {
        return [solicitacoes.filter(s => s.usuario_id === Number(params[0]))];
    }
    if (q.startsWith("UPDATE solicitacoes_pontos SET status")) {
        const s = solicitacoes.find(x => x.id === Number(params[1]));
        if (s) s.status = params[0];
        return [{ affectedRows: s ? 1 : 0 }];
    }
    if (q.startsWith("SELECT id, nome, endereco, materiais")) return [[]];
    if (q.startsWith("SELECT id FROM pontos_coleta")) return [[]];
    if (q.startsWith("INSERT INTO pontos_coleta")) return [{ insertId: 10 }];
    if (q.startsWith("DELETE FROM pontos_coleta")) return [{ affectedRows: 1 }];
    if (q.startsWith("SELECT id, usuario_id")) return [solicitacoes];
    throw new Error("Consulta não prevista no teste: " + q);
};

let servidor, base;
before(async () => {
    await new Promise(r => { servidor = app.listen(0, r); });
    base = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => servidor.close());

const tokenDe = (id, perfil, extra = {}) =>
    jwt.sign({ id, perfil, ...extra }, process.env.JWT_SECRET, { expiresIn: "1h" });

const chamar = (metodo, rota, token, corpo) =>
    fetch(base + rota, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: corpo ? JSON.stringify(corpo) : undefined
    });

const pontoValido = {
    nome: "Ecoponto", endereco: "Rua A, 1", materiais: "Papel", horario: "8h às 17h"
};

test("sem token -> 401", async () => {
    assert.equal((await chamar("GET", "/api/pontos")).status, 401);
});

test("token com assinatura inválida -> 401", async () => {
    const falso = jwt.sign({ id: 1, perfil: "admin" }, "outra_chave");
    assert.equal((await chamar("GET", "/api/pontos", falso)).status, 401);
});

test("usuário comum não cria, edita nem exclui pontos -> 403", async () => {
    const t = tokenDe(2, "usuario");
    assert.equal((await chamar("POST", "/api/pontos", t, pontoValido)).status, 403);
    assert.equal((await chamar("PUT", "/api/pontos/1", t, pontoValido)).status, 403);
    assert.equal((await chamar("DELETE", "/api/pontos/1", t)).status, 403);
});

test("admin cria e exclui ponto", async () => {
    const t = tokenDe(1, "admin");
    assert.equal((await chamar("POST", "/api/pontos", t, pontoValido)).status, 201);
    assert.equal((await chamar("DELETE", "/api/pontos/1", t)).status, 200);
});

test("token antigo com perfil admin, mas usuário rebaixado no banco -> 403", async () => {
    const tokenAntigo = tokenDe(1, "admin");
    usuarios.get(1).perfil = "usuario"; // rebaixado depois do login
    try {
        assert.equal((await chamar("POST", "/api/pontos", tokenAntigo, pontoValido)).status, 403);
        assert.equal((await chamar("GET", "/api/solicitacoes", tokenAntigo)).status, 403);
    } finally {
        usuarios.get(1).perfil = "admin";
    }
});

test("token de conta excluída -> 401", async () => {
    const t = tokenDe(99, "admin");
    assert.equal((await chamar("GET", "/api/pontos", t)).status, 401);
});

test("perfil promovido no banco vale mesmo com token antigo de 'usuario'", async () => {
    const tokenAntigo = tokenDe(3, "usuario");
    usuarios.get(3).perfil = "admin";
    try {
        assert.equal((await chamar("POST", "/api/pontos", tokenAntigo, pontoValido)).status, 201);
    } finally {
        usuarios.get(3).perfil = "usuario";
    }
});

test("validação de formato e limites no backend -> 400", async () => {
    const t = tokenDe(1, "admin");
    const longo = "x".repeat(300);
    assert.equal((await chamar("POST", "/api/pontos", t, { ...pontoValido, nome: longo })).status, 400);
    assert.equal((await chamar("POST", "/api/pontos", t, { ...pontoValido, horario: 123 })).status, 400);
    assert.equal((await chamar("PUT", "/api/pontos/abc", t, pontoValido)).status, 400);
    assert.equal((await chamar("DELETE", "/api/pontos/1;DROP", t)).status, 400);
});

test("cadastro rejeita e-mail inválido e senha acima do limite -> 400", async () => {
    const r1 = await chamar("POST", "/api/auth/registrar", null, { nome: "A", email: "invalido", senha: "123456" });
    assert.equal(r1.status, 400);
    const r2 = await chamar("POST", "/api/auth/registrar", null, { nome: "A", email: "a@b.com", senha: "x".repeat(100) });
    assert.equal(r2.status, 400);
});

test("cliente só vê e exclui as próprias solicitações", async () => {
    solicitacoes = [
        { id: 1, usuario_id: 2, status: "pendente" },
        { id: 2, usuario_id: 3, status: "pendente" }
    ];
    const ana = tokenDe(2, "usuario");

    const minhas = await (await chamar("GET", "/api/solicitacoes/minhas", ana)).json();
    assert.deepEqual(minhas.map(s => s.id), [1]);

    // tenta apagar a solicitação do Beto (id 2)
    assert.equal((await chamar("DELETE", "/api/solicitacoes/2", ana)).status, 404);
    assert.equal(solicitacoes.length, 2);

    // apaga a própria
    assert.equal((await chamar("DELETE", "/api/solicitacoes/1", ana)).status, 200);
    assert.deepEqual(solicitacoes.map(s => s.id), [2]);
});

test("cliente não lista todas nem altera status; admin altera", async () => {
    solicitacoes = [{ id: 5, usuario_id: 3, status: "pendente" }];
    const ana = tokenDe(2, "usuario");
    const adm = tokenDe(1, "admin");

    assert.equal((await chamar("GET", "/api/solicitacoes", ana)).status, 403);
    assert.equal((await chamar("PATCH", "/api/solicitacoes/5", ana, { status: "aprovada" })).status, 403);
    assert.equal(solicitacoes[0].status, "pendente");

    assert.equal((await chamar("PATCH", "/api/solicitacoes/5", adm, { status: "aprovada" })).status, 200);
    assert.equal(solicitacoes[0].status, "aprovada");
    assert.equal((await chamar("PATCH", "/api/solicitacoes/5", adm, { status: "invalido" })).status, 400);
});

test("admin não exclui solicitações pelo histórico de clientes -> 403", async () => {
    solicitacoes = [{ id: 7, usuario_id: 2, status: "pendente" }];
    assert.equal((await chamar("DELETE", "/api/solicitacoes/7", tokenDe(1, "admin"))).status, 403);
    assert.equal(solicitacoes.length, 1);
});
