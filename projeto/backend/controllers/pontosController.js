
import { pool } from "../database/conexao.js";

// Verifica os campos obrigatórios
function dadosValidos({ nome, endereco, materiais, horario }) {
    return Boolean(
        nome?.trim() &&
        endereco?.trim() &&
        materiais?.trim() &&
        horario?.trim()
    );
}

// Verifica se já existe outro ponto com mesmo nome e endereço
async function pontoDuplicado(nome, endereco, id = null) {
    let sql = `
        SELECT id
        FROM pontos_coleta
        WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
        AND LOWER(TRIM(endereco)) = LOWER(TRIM(?))
    `;

    const parametros = [nome, endereco];

    // Na edição, não considera o próprio registro como duplicado
    if (id !== null) {
        sql += " AND id != ?";
        parametros.push(id);
    }

    const [pontos] = await pool.query(sql, parametros);

    return pontos.length > 0;
}

// LISTAR E PESQUISAR PONTOS
export async function listarPontos(req, res) {
    try {
        const { busca = "", material = "" } = req.query;

        let sql = `
            SELECT id, nome, endereco, materiais, horario, observacoes
            FROM pontos_coleta
            WHERE 1 = 1
        `;

        const parametros = [];

        // Pesquisa por nome ou endereço
        if (busca.trim()) {
            sql += `
                AND (
                    nome LIKE ?
                    OR endereco LIKE ?
                )
            `;

            const pesquisa = `%${busca.trim()}%`;
            parametros.push(pesquisa, pesquisa);
        }

        // Filtro por material recebido
        if (material.trim()) {
            sql += " AND materiais LIKE ?";
            parametros.push(`%${material.trim()}%`);
        }

        sql += " ORDER BY nome";

        const [pontos] = await pool.query(sql, parametros);

        res.json(pontos);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao listar pontos de coleta."
        });
    }
}

// BUSCAR UM PONTO PELO ID
export async function buscarPonto(req, res) {
    try {
        const [pontos] = await pool.query(
            `SELECT id, nome, endereco, materiais, horario, observacoes
             FROM pontos_coleta
             WHERE id = ?`,
            [req.params.id]
        );

        if (!pontos.length) {
            return res.status(404).json({
                mensagem: "Ponto de coleta não encontrado."
            });
        }

        res.json(pontos[0]);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao buscar ponto de coleta."
        });
    }
}

// CADASTRAR PONTO
export async function criarPonto(req, res) {
    try {
        const {
            nome,
            endereco,
            materiais,
            horario,
            observacoes = ""
        } = req.body;

        if (!dadosValidos(req.body)) {
            return res.status(400).json({
                mensagem: "Preencha nome, endereço, materiais e horário."
            });
        }

        // Verifica duplicidade
        const duplicado = await pontoDuplicado(nome, endereco);

        if (duplicado) {
            return res.status(409).json({
                mensagem: "Já existe um ponto de coleta com esse nome e endereço."
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO pontos_coleta
            (nome, endereco, materiais, horario, observacoes, criado_por)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nome.trim(),
                endereco.trim(),
                materiais.trim(),
                horario.trim(),
                observacoes.trim(),
                req.usuario.id
            ]
        );

        res.status(201).json({
            mensagem: "Ponto de coleta cadastrado!",
            id: resultado.insertId
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao cadastrar ponto de coleta."
        });
    }
}

// ATUALIZAR PONTO
export async function atualizarPonto(req, res) {
    try {
        const {
            nome,
            endereco,
            materiais,
            horario,
            observacoes = ""
        } = req.body;

        if (!dadosValidos(req.body)) {
            return res.status(400).json({
                mensagem: "Preencha nome, endereço, materiais e horário."
            });
        }

        // Verifica duplicidade sem considerar o próprio ponto
        const duplicado = await pontoDuplicado(
            nome,
            endereco,
            req.params.id
        );

        if (duplicado) {
            return res.status(409).json({
                mensagem: "Já existe outro ponto com esse nome e endereço."
            });
        }

        const [resultado] = await pool.query(
            `UPDATE pontos_coleta
             SET nome = ?, endereco = ?, materiais = ?,
                 horario = ?, observacoes = ?
             WHERE id = ?`,
            [
                nome.trim(),
                endereco.trim(),
                materiais.trim(),
                horario.trim(),
                observacoes.trim(),
                req.params.id
            ]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                mensagem: "Ponto de coleta não encontrado."
            });
        }

        res.json({
            mensagem: "Ponto de coleta atualizado!"
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao atualizar ponto de coleta."
        });
    }
}

// EXCLUIR PONTO
export async function excluirPonto(req, res) {
    try {
        const [resultado] = await pool.query(
            "DELETE FROM pontos_coleta WHERE id = ?",
            [req.params.id]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                mensagem: "Ponto de coleta não encontrado."
            });
        }

        res.json({
            mensagem: "Ponto de coleta excluído!"
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao excluir ponto de coleta."
        });
    }
}
