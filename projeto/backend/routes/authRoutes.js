import { Router } from "express";
import {
    registrar,
    login,
    minhaConta,
    atualizarMinhaConta,
    excluirMinhaConta
} from "../controllers/authController.js";
import { autenticar } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/registrar", registrar);
router.post("/login", login);
router.get("/minha-conta", autenticar, minhaConta);
router.put("/minha-conta", autenticar, atualizarMinhaConta);
router.delete("/minha-conta", autenticar, excluirMinhaConta);

export default router;