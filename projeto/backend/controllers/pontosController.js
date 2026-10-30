import { pool } from "../database/conexao.js";

function dadosValidos({ nome, endereco, materiais, horario }) {
    return Boolean(nome?.trim() && endereco?.trim() && materiais?.trim() && horario?.trim());
}

export async function listarPontos(req, res) {
    try {
        const [pontos] = await pool.query(
            "SELECT id, nome, endereco, materiais, horario, observacoes FROM pontos_coleta ORDER BY nome"
        );
        res.json(pontos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro ao listar pontos de coleta." });
    }
}

export async function buscarPonto(req, res) {
    try {
        const [pontos] = await pool.query(
            "SELECT id, nome, endereco, materiais, horario, observacoes FROM pontos_coleta WHERE id = ?",
            [req.params.id]
        );
        if (!pontos.length) return res.status(404).json({ mensagem: "Ponto de coleta não encontrado." });
        res.json(pontos[0]);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro ao buscar ponto de coleta." });
    }
}

export async function criarPonto(req, res) {
    try {
        const { nome, endereco, materiais, horario, observacoes = "" } = req.body;
        if (!dadosValidos(req.body)) return res.status(400).json({ mensagem: "Preencha nome, endereço, materiais e horário." });
        const [resultado] = await pool.query(
            "INSERT INTO pontos_coleta (nome, endereco, materiais, horario, observacoes, criado_por) VALUES (?, ?, ?, ?, ?, ?)",
            [nome.trim(), endereco.trim(), materiais.trim(), horario.trim(), observacoes.trim(), req.usuario.id]
        );
        res.status(201).json({ mensagem: "Ponto de coleta cadastrado!", id: resultado.insertId });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro ao cadastrar ponto de coleta." });
    }
}

export async function atualizarPonto(req, res) {
    try {
        const { nome, endereco, materiais, horario, observacoes = "" } = req.body;
        if (!dadosValidos(req.body)) return res.status(400).json({ mensagem: "Preencha nome, endereço, materiais e horário." });
        const [resultado] = await pool.query(
            "UPDATE pontos_coleta SET nome = ?, endereco = ?, materiais = ?, horario = ?, observacoes = ? WHERE id = ?",
            [nome.trim(), endereco.trim(), materiais.trim(), horario.trim(), observacoes.trim(), req.params.id]
        );
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: "Ponto de coleta não encontrado." });
        res.json({ mensagem: "Ponto de coleta atualizado!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro ao atualizar ponto de coleta." });
    }
}

export async function excluirPonto(req, res) {
    try {
        const [resultado] = await pool.query("DELETE FROM pontos_coleta WHERE id = ?", [req.params.id]);
        if (!resultado.affectedRows) return res.status(404).json({ mensagem: "Ponto de coleta não encontrado." });
        res.json({ mensagem: "Ponto de coleta excluído!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ mensagem: "Erro ao excluir ponto de coleta." });
    }
}
