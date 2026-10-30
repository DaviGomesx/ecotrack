import express from "express";
import cors from "cors";
import "dotenv/config";
import { testarConexao } from "./database/conexao.js";
import authRoutes from "./routes/authRoutes.js";
import pontosRoutes from "./routes/pontosRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ mensagem: "API EcoTrack funcionando!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/pontos", pontosRoutes);

app.use((req, res) => {
    res.status(404).json({ mensagem: "Rota não encontrada." });
});

async function iniciarServidor() {
    try {
        await testarConexao();
        app.listen(PORT, () => console.log(`EcoTrack rodando em http://localhost:${PORT}`));
    } catch (erro) {
    console.error("Erro completo:", erro);
}
}
iniciarServidor();
