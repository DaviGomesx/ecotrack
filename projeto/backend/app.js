import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import pontosRoutes from "./routes/pontosRoutes.js";
import solicitacoesRoutes from "./routes/solicitacoesRoutes.js";

const app = express();

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

export default app;
