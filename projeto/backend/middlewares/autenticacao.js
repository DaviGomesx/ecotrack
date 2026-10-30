import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization;
    if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
        return res.status(401).json({ mensagem: "Faça login para continuar." });
    }
    const token = cabecalho.split(" ")[1];
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ mensagem: "Token inválido ou expirado. Entre novamente." });
    }
}

export function apenasAdmin(req, res, next) {
    if (req.usuario?.perfil !== "admin") {
        return res.status(403).json({ mensagem: "Apenas administradores podem realizar esta ação." });
    }
    next();
}
