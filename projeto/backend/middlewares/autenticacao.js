import jwt from "jsonwebtoken";
import { pool } from "../database/conexao.js";

// Valida o token JWT e REVALIDA o usuário no MySQL a cada requisição.
// Assim, tokens de contas excluídas deixam de funcionar e o perfil usado
// nas permissões é sempre o perfil atual gravado no banco (não o do token).
export async function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization;
    if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
        return res.status(401).json({ mensagem: "Faça login para continuar." });
    }

    const token = cabecalho.split(" ")[1];
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ mensagem: "Token inválido ou expirado. Entre novamente." });
    }

    try {
        const [usuarios] = await pool.query(
            "SELECT id, nome, email, perfil FROM usuarios WHERE id = ?",
            [payload.id]
        );

        if (!usuarios.length) {
            return res.status(401).json({ mensagem: "Conta não encontrada. Entre novamente." });
        }

        // Perfil e dados atuais vindos do banco
        req.usuario = usuarios[0];
        next();
    } catch (erro) {
        console.error("[AUTENTICACAO]", erro.code || erro.message);
        return res.status(500).json({ mensagem: "Erro ao validar a sessão." });
    }
}

export function apenasAdmin(req, res, next) {
    if (req.usuario?.perfil !== "admin") {
        return res.status(403).json({ mensagem: "Apenas administradores podem realizar esta ação." });
    }
    next();
}
