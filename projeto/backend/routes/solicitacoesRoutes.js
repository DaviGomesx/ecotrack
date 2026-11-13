import { Router } from "express";
import { autenticar, apenasAdmin } from "../middlewares/autenticacao.js";
import { criarSolicitacao, listarMinhasSolicitacoes, listarSolicitacoes, atualizarStatusSolicitacao, excluirMinhaSolicitacao } from "../controllers/solicitacoesController.js";
const router = Router();
router.use(autenticar);
router.post("/", criarSolicitacao);
// O cliente consulta exclusivamente as solicitações vinculadas ao próprio usuário.
router.get("/minhas", listarMinhasSolicitacoes);
router.get("/", apenasAdmin, listarSolicitacoes);
router.patch("/:id", apenasAdmin, atualizarStatusSolicitacao);
// A exclusão é restrita pelo controlador ao proprietário autenticado.
router.delete("/:id", excluirMinhaSolicitacao);
export default router;
