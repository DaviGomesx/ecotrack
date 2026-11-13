import express from "express";
import cors from "cors";
import "dotenv/config";
import { testarConexao } from "./database/conexao.js";
import authRoutes from "./routes/authRoutes.js";
import pontosRoutes from "./routes/pontosRoutes.js";
import solicitacoesRoutes from "./routes/solicitacoesRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ mensagem: "API EcoTrack funcionando!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/pontos", pontosRoutes);
app.use("/api/solicitacoes", solicitacoesRoutes);

app.use((req, res) => {
    res.status(404).json({ mensagem: "Rota não encontrada." });
});

async function garantirTabelaSolicitacoes() {
    // Garante a tabela mesmo quando o usuário atualizou o código, mas esqueceu
    // de executar a migração SQL manualmente. Não apaga nem altera dados existentes.
    const { pool } = await import("./database/conexao.js");
    await pool.query(`
        CREATE TABLE IF NOT EXISTS solicitacoes_pontos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            nome_usuario VARCHAR(100) NOT NULL,
            email_usuario VARCHAR(150) NOT NULL,
            nome_ponto VARCHAR(120) NOT NULL,
            endereco VARCHAR(200) NOT NULL,
            cidade VARCHAR(120) NOT NULL,
            materiais TEXT NOT NULL,
            horario VARCHAR(120) NOT NULL,
            telefone VARCHAR(40) DEFAULT '',
            detalhes TEXT,
            status ENUM('pendente', 'em análise', 'aprovada', 'recusada') NOT NULL DEFAULT 'pendente',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_solicitacao_usuario FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Tabela solicitacoes_pontos verificada.");
}

async function iniciarServidor() {
    try {
        await testarConexao();
        await garantirTabelaSolicitacoes();
        app.listen(PORT, () => console.log(`EcoTrack rodando em http://localhost:${PORT}`));
    } catch (erro) {
        console.error("Não foi possível iniciar o EcoTrack:", erro.code || erro.message, erro);
        process.exit(1);
    }
}
iniciarServidor();
