import { Router } from "express";
import {
    registrar,
    login,
    minhaConta,
    atualizarMinhaConta
} from "../controllers/authController.js";
import { autenticar } from "../middlewares/autenticacao.js";

const router = Router();

router.post("/registrar", registrar);
router.post("/login", login);
router.get("/minha-conta", autenticar, minhaConta);
router.put("/minha-conta", autenticar, atualizarMinhaConta);

export default router;