import { Router } from "express";
import { autenticar, apenasAdmin } from "../middlewares/autenticacao.js";
import {
    listarPontos, buscarPonto, criarPonto, atualizarPonto, excluirPonto
} from "../controllers/pontosController.js";

const router = Router();
router.use(autenticar);
router.get("/", listarPontos);
router.get("/:id", buscarPonto);
router.post("/", apenasAdmin, criarPonto);
router.put("/:id", apenasAdmin, atualizarPonto);
router.delete("/:id", apenasAdmin, excluirPonto);
export default router;
