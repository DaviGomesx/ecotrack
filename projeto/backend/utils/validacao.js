// Funções de validação compartilhadas pelos controllers.
// Os limites seguem o tamanho das colunas definidas em sql/ecotrack.sql.

export const LIMITES = {
    nomeUsuario: 100,
    email: 150,
    senhaMin: 6,
    senhaMax: 72, // limite do bcrypt
    nomePonto: 120,
    endereco: 200,
    cidade: 120,
    materiais: 255,
    materiaisSolicitacao: 1000,
    horario: 120,
    telefone: 40,
    texto: 2000
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONE = /^[0-9()+\-.\s]{8,40}$/;

export function textoValido(valor, max, { obrigatorio = true } = {}) {
    if (valor === undefined || valor === null || valor === "") return !obrigatorio;
    if (typeof valor !== "string") return false;
    const texto = valor.trim();
    if (!texto) return !obrigatorio;
    return texto.length <= max;
}

export function emailValido(email) {
    return typeof email === "string"
        && email.trim().length <= LIMITES.email
        && REGEX_EMAIL.test(email.trim());
}

export function telefoneValido(telefone) {
    if (telefone === undefined || telefone === null || telefone === "") return true;
    return typeof telefone === "string" && REGEX_TELEFONE.test(telefone.trim());
}

export function senhaValida(senha) {
    return typeof senha === "string"
        && senha.length >= LIMITES.senhaMin
        && senha.length <= LIMITES.senhaMax;
}

export function idValido(valor) {
    return /^[1-9][0-9]{0,9}$/.test(String(valor));
}
