import { pool } from "../database/conexao.js";

export async function criarSolicitacao(req, res) {
  try {
    const { nome_ponto, endereco, cidade, materiais, horario, telefone, detalhes } = req.body;
    if (![nome_ponto, endereco, cidade, materiais, horario].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ mensagem: "Preencha nome do local, endereço, cidade, materiais e horário." });
    }
    const [usuarios] = await pool.query("SELECT nome, email FROM usuarios WHERE id = ?", [req.usuario.id]);
    if (!usuarios.length) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    const [result] = await pool.query(
      `INSERT INTO solicitacoes_pontos (usuario_id, nome_usuario, email_usuario, nome_ponto, endereco, cidade, materiais, horario, telefone, detalhes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, usuarios[0].nome, usuarios[0].email, nome_ponto.trim(), endereco.trim(), cidade.trim(), materiais.trim(), horario.trim(), (telefone || "").trim(), (detalhes || "").trim()]
    );
    res.status(201).json({ mensagem: "Sugestão enviada! Nossa equipe administrativa poderá analisá-la.", id: result.insertId });
  } catch (e) {
    console.error("[SOLICITACOES][CRIAR]", e.code || e.message, e);
    res.status(500).json({ mensagem: "Não foi possível enviar a sugestão. Verifique a conexão com o banco e a tabela solicitacoes_pontos.", codigo: e.code || "ERRO_INTERNO" });
  }
}


export async function listarMinhasSolicitacoes(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, nome_ponto, endereco, cidade, materiais, horario, telefone, detalhes, status, criado_em
       FROM solicitacoes_pontos WHERE usuario_id = ? ORDER BY criado_em DESC, id DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (e) {
    console.error("[SOLICITACOES][MINHAS]", e.code || e.message, e);
    res.status(500).json({ mensagem: "Não foi possível carregar seu histórico de solicitações." });
  }
}

export async function listarSolicitacoes(req, res) {
  try {
    const [rows] = await pool.query("SELECT id, usuario_id, nome_usuario, email_usuario, nome_ponto, endereco, cidade, materiais, horario, telefone, detalhes, status, criado_em FROM solicitacoes_pontos ORDER BY criado_em DESC");
    res.json(rows);
  } catch (e) {
    console.error("[SOLICITACOES][LISTAR]", e.code || e.message, e);
    res.status(500).json({ mensagem: "Não foi possível carregar as solicitações. Verifique a tabela solicitacoes_pontos no banco configurado.", codigo: e.code || "ERRO_INTERNO" });
  }
}

export async function atualizarStatusSolicitacao(req, res) {
  try {
    const { status } = req.body;
    if (!["pendente", "em análise", "aprovada", "recusada"].includes(status)) return res.status(400).json({ mensagem: "Status inválido." });
    const [result] = await pool.query("UPDATE solicitacoes_pontos SET status = ? WHERE id = ?", [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ mensagem: "Sugestão não encontrada." });
    res.json({ mensagem: "Status da sugestão atualizado." });
  } catch (e) {
    console.error("[SOLICITACOES][STATUS]", e.code || e.message, e);
    res.status(500).json({ mensagem: "Erro ao atualizar a solicitação.", codigo: e.code || "ERRO_INTERNO" });
  }
}


export async function excluirMinhaSolicitacao(req, res) {
  try {
    if (req.usuario?.perfil === "admin") {
      return res.status(403).json({ mensagem: "Administradores não podem excluir solicitações pelo histórico de clientes." });
    }
    const [result] = await pool.query(
      "DELETE FROM solicitacoes_pontos WHERE id = ? AND usuario_id = ?",
      [req.params.id, req.usuario.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ mensagem: "Solicitação não encontrada na sua conta." });
    }
    return res.json({ mensagem: "Solicitação excluída com sucesso." });
  } catch (e) {
    console.error("[SOLICITACOES][EXCLUIR_MINHA]", e.code || e.message, e);
    return res.status(500).json({ mensagem: "Não foi possível excluir a solicitação." });
  }
}
