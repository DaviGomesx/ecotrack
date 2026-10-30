import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database/conexao.js";

export async function registrar(req, res) {
    try {
        const { nome, email, senha } = req.body;

        if (!nome?.trim() || !email?.trim() || !senha) {
            return res.status(400).json({
                mensagem: "Preencha nome, e-mail e senha."
            });
        }

        if (senha.length < 6) {
            return res.status(400).json({
                mensagem: "A senha deve ter pelo menos 6 caracteres."
            });
        }

        const [existentes] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (existentes.length) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        const senhaProtegida = await bcrypt.hash(senha, 10);

        await pool.query(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            [nome.trim(), email.trim().toLowerCase(), senhaProtegida]
        );

        return res.status(201).json({
            mensagem: "Conta criada! Agora faça login."
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: "Erro ao criar conta."
        });
    }
}

export async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe e-mail e senha."
            });
        }

        const [usuarios] = await pool.query(
            "SELECT id, nome, email, senha, perfil FROM usuarios WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        if (
            !usuarios.length ||
            !(await bcrypt.compare(senha, usuarios[0].senha))
        ) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        const usuario = usuarios[0];

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            },
            process.env.JWT_SECRET,
            { expiresIn: "4h" }
        );

        return res.json({
            mensagem: "Login realizado!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: "Erro ao realizar login."
        });
    }
}

export async function minhaConta(req, res) {
    try {
        const [usuarios] = await pool.query(
            "SELECT id, nome, email, perfil FROM usuarios WHERE id = ?",
            [req.usuario.id]
        );

        if (!usuarios.length) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        return res.json(usuarios[0]);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: "Erro ao consultar a conta."
        });
    }
}

export async function atualizarMinhaConta(req, res) {
    try {
        const { nome, email, senha } = req.body;

        if (!nome?.trim() || !email?.trim()) {
            return res.status(400).json({
                mensagem: "Nome e e-mail são obrigatórios."
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const [existentes] = await pool.query(
            "SELECT id FROM usuarios WHERE email = ? AND id <> ?",
            [emailNormalizado, req.usuario.id]
        );

        if (existentes.length) {
            return res.status(409).json({
                mensagem: "Este e-mail já está sendo usado por outra conta."
            });
        }

        if (senha && senha.length < 6) {
            return res.status(400).json({
                mensagem: "A senha deve ter pelo menos 6 caracteres."
            });
        }

        if (senha) {
            const senhaProtegida = await bcrypt.hash(senha, 10);

            await pool.query(
                "UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?",
                [
                    nome.trim(),
                    emailNormalizado,
                    senhaProtegida,
                    req.usuario.id
                ]
            );
        } else {
            await pool.query(
                "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
                [nome.trim(), emailNormalizado, req.usuario.id]
            );
        }

        const [usuarios] = await pool.query(
            "SELECT id, nome, email, perfil FROM usuarios WHERE id = ?",
            [req.usuario.id]
        );

        return res.json({
            mensagem: "Conta atualizada com sucesso!",
            usuario: usuarios[0]
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            mensagem: "Erro ao atualizar a conta."
        });
    }
}