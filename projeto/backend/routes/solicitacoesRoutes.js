import { Router } from "express";
import { autenticar, apenasAdmin } from "../middlewares/autenticacao.js";
import { criarSolicitacao, listarSolicitacoes, atualizarStatusSolicitacao } from "../controllers/solicitacoesController.js";
const router = Router();
router.use(autenticar);
router.post("/", criarSolicitacao);
router.get("/", apenasAdmin, listarSolicitacoes);
router.patch("/:id", apenasAdmin, atualizarStatusSolicitacao);
export default router;
