
const API = "http://localhost:3000/api";

const painelAuth = document.getElementById("painelAuth");
const painelApp = document.getElementById("painelApp");
const formAuth = document.getElementById("formAuth");
const labelNome = document.getElementById("labelNome");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const btnAuth = document.getElementById("btnAuth");
const mensagem = document.getElementById("mensagem");
const listaPontos = document.getElementById("listaPontos");
const painelFormulario = document.getElementById("painelFormulario");
const painelConta = document.getElementById("painelConta");
const formConta = document.getElementById("formConta");
const contaNome = document.getElementById("contaNome");
const contaEmail = document.getElementById("contaEmail");
const contaSenha = document.getElementById("contaSenha");
const btnSalvarConta = document.getElementById("btnSalvarConta");

// NOVOS CAMPOS DE PESQUISA
const campoBusca = document.getElementById("campoBusca");
const filtroMaterial = document.getElementById("filtroMaterial");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");

let modoAuth = "login";

let token = localStorage.getItem("ecotrack_token");

let usuario = JSON.parse(
    localStorage.getItem("ecotrack_usuario") || "null"
);

// EVENTOS
document.getElementById("abaLogin").addEventListener("click", () => {
    mudarModoAuth("login");
});

document.getElementById("abaRegistro").addEventListener("click", () => {
    mudarModoAuth("registro");
});

formAuth.addEventListener("submit", entrarOuRegistrar);

document.getElementById("btnSair").addEventListener("click", sair);

document.getElementById("formPonto").addEventListener("submit", salvarPonto);

document.getElementById("btnCancelar").addEventListener("click", limparFormulario);

document.getElementById("usuarioLogado").addEventListener("click", abrirMinhaConta);

document.getElementById("btnCancelarConta").addEventListener("click", fecharMinhaConta);

formConta.addEventListener("submit", salvarMinhaConta);

// EVENTOS DOS FILTROS
campoBusca.addEventListener("input", carregarPontos);

filtroMaterial.addEventListener("change", carregarPontos);

btnLimparFiltros.addEventListener("click", () => {
    campoBusca.value = "";
    filtroMaterial.value = "";
    carregarPontos();
});

// ALTERAR MODO DE LOGIN OU CADASTRO
function mudarModoAuth(modo) {
    modoAuth = modo;

    const registro = modo === "registro";

    labelNome.hidden = !registro;
    campoNome.hidden = !registro;
    campoNome.required = registro;

    campoSenha.autocomplete = registro
        ? "new-password"
        : "current-password";

    btnAuth.textContent = registro
        ? "Criar conta"
        : "Entrar";

    document.getElementById("abaLogin")
        .classList.toggle("ativa", !registro);

    document.getElementById("abaRegistro")
        .classList.toggle("ativa", registro);
}

// ENTRAR OU REGISTRAR
async function entrarOuRegistrar(evento) {
    evento.preventDefault();

    const rota = modoAuth === "registro"
        ? "/auth/registrar"
        : "/auth/login";

    const dados = {
        email: campoEmail.value.trim(),
        senha: campoSenha.value
    };

    if (modoAuth === "registro") {
        dados.nome = campoNome.value.trim();
    }

    btnAuth.disabled = true;

    try {
        const resposta = await fetch(API + rota, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Não foi possível continuar.");
        }

        if (modoAuth === "registro") {
            mostrarMensagem(resultado.mensagem);
            mudarModoAuth("login");
            campoSenha.value = "";

        } else {
            token = resultado.token;
            usuario = resultado.usuario;

            localStorage.setItem("ecotrack_token", token);

            localStorage.setItem(
                "ecotrack_usuario",
                JSON.stringify(usuario)
            );

            mostrarAplicacao();
        }

    } catch (erro) {
        alert(erro.message);

    } finally {
        btnAuth.disabled = false;
    }
}

// ABRIR A APLICAÇÃO
function mostrarAplicacao() {
    painelAuth.hidden = true;
    painelApp.hidden = false;

    document.getElementById("usuarioLogado").textContent =
        `${usuario.nome} · ${
            usuario.perfil === "admin" ? "Administrador" : "Usuário"
        }`;

    painelFormulario.hidden = usuario.perfil !== "admin";

    carregarPontos();
}

// SAIR
function sair() {
    localStorage.removeItem("ecotrack_token");
    localStorage.removeItem("ecotrack_usuario");

    token = null;
    usuario = null;

    painelAuth.hidden = false;
    painelApp.hidden = true;

    document.getElementById("usuarioLogado").textContent = "";

    formAuth.reset();

    campoBusca.value = "";
    filtroMaterial.value = "";

    mostrarMensagem("");
}

// MENSAGENS
function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle("erro", erro);
}

// REQUISIÇÕES À API
async function requisicao(rota, opcoes = {}) {
    const resposta = await fetch(API + rota, {
        ...opcoes,

        headers: {
            ...(opcoes.headers || {}),
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const dados = resposta.status === 204
        ? {}
        : await resposta.json();

    if (resposta.status === 401) {
        sair();
        throw new Error("Sua sessão expirou. Entre novamente.");
    }

    if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro na requisição.");
    }

    return dados;
}

// LISTAR, PESQUISAR E FILTRAR PONTOS
async function carregarPontos() {
    try {
        mostrarMensagem("Carregando pontos de coleta...");

        // Pega os valores dos filtros
        const busca = campoBusca.value.trim();
        const material = filtroMaterial.value;

        // Prepara os parâmetros para enviar à API
        const parametros = new URLSearchParams();

        if (busca) {
            parametros.append("busca", busca);
        }

        if (material) {
            parametros.append("material", material);
        }

        const consulta = parametros.toString();

        const rota = consulta
            ? `/pontos?${consulta}`
            : "/pontos";

        // Busca os pontos com os filtros selecionados
        const pontos = await requisicao(rota);

        listaPontos.replaceChildren();

        if (!pontos.length) {
            mostrarMensagem(
                "Nenhum ponto de coleta encontrado. Tente outros filtros."
            );
            return;
        }

        // Monta os cartões dos pontos
        pontos.forEach(ponto => {
            const cartao = document.createElement("article");
            cartao.className = "ponto";

            const titulo = document.createElement("h2");
            titulo.textContent = ponto.nome;

            const etiqueta = document.createElement("span");
            etiqueta.className = "etiqueta";
            etiqueta.textContent = "Ponto de coleta";

            cartao.append(titulo, etiqueta);

            adicionarTexto(
                cartao,
                "📍 Endereço: ",
                ponto.endereco
            );

            adicionarTexto(
                cartao,
                "♻ Materiais recebidos: ",
                ponto.materiais
            );

            adicionarTexto(
                cartao,
                "🕒 Horário: ",
                ponto.horario
            );

            if (ponto.observacoes) {
                adicionarTexto(
                    cartao,
                    "ℹ Orientações e observações: ",
                    ponto.observacoes
                );
            }

            // Ações exclusivas do administrador
            if (usuario.perfil === "admin") {
                const acoes = document.createElement("div");
                acoes.className = "acoes-card";

                const editar = document.createElement("button");
                editar.className = "secundario";
                editar.textContent = "Editar";

                editar.addEventListener("click", () => {
                    preencherFormulario(ponto);
                });

                const excluir = document.createElement("button");
                excluir.className = "primario";
                excluir.textContent = "Excluir";

                excluir.addEventListener("click", () => {
                    excluirPonto(ponto.id);
                });

                acoes.append(editar, excluir);
                cartao.append(acoes);
            }

            listaPontos.append(cartao);
        });

        mostrarMensagem(
            `${pontos.length} ponto(s) de coleta encontrado(s).`
        );

    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
}

// ADICIONAR TEXTOS AOS CARTÕES
function adicionarTexto(cartao, rotulo, valor) {
    const paragrafo = document.createElement("p");

    const forte = document.createElement("strong");
    forte.textContent = rotulo;

    paragrafo.append(
        forte,
        document.createTextNode(valor || "Não informado")
    );

    cartao.append(paragrafo);
}

// PREENCHER FORMULÁRIO PARA EDIÇÃO
function preencherFormulario(ponto) {
    document.getElementById("pontoId").value = ponto.id;

    document.getElementById("pontoNome").value = ponto.nome;

    document.getElementById("pontoEndereco").value = ponto.endereco;

    document.getElementById("pontoMateriais").value = ponto.materiais;

    document.getElementById("pontoHorario").value = ponto.horario;

    document.getElementById("pontoObs").value =
        ponto.observacoes || "";

    document.getElementById("tituloFormulario").textContent =
        "Editar ponto de coleta";

    document.getElementById("btnSalvar").textContent =
        "Salvar alterações";

    document.getElementById("btnCancelar").hidden = false;

    painelFormulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// LIMPAR FORMULÁRIO
function limparFormulario() {
    document.getElementById("formPonto").reset();

    document.getElementById("pontoId").value = "";

    document.getElementById("tituloFormulario").textContent =
        "Cadastrar ponto";

    document.getElementById("btnSalvar").textContent =
        "Cadastrar ponto";

    document.getElementById("btnCancelar").hidden = true;
}

// CADASTRAR OU EDITAR PONTO
async function salvarPonto(evento) {
    evento.preventDefault();

    const id = document.getElementById("pontoId").value;

    const dados = {
        nome: document.getElementById("pontoNome").value.trim(),

        endereco: document.getElementById("pontoEndereco").value.trim(),

        materiais: document.getElementById("pontoMateriais").value.trim(),

        horario: document.getElementById("pontoHorario").value.trim(),

        observacoes: document.getElementById("pontoObs").value.trim()
    };

    try {
        const resultado = await requisicao(
            id ? `/pontos/${id}` : "/pontos",
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(dados)
            }
        );

        limparFormulario();

        mostrarMensagem(resultado.mensagem);

        await carregarPontos();

    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
}

// EXCLUIR PONTO
async function excluirPonto(id) {
    if (!confirm("Tem certeza que deseja excluir este ponto de coleta?")) {
        return;
    }

    try {
        const resultado = await requisicao(
            `/pontos/${id}`,
            {
                method: "DELETE"
            }
        );

        mostrarMensagem(resultado.mensagem);

        await carregarPontos();

    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
}

// ABRIR MINHA CONTA
async function abrirMinhaConta() {
    try {
        const dados = await requisicao("/auth/minha-conta");

        contaNome.value = dados.nome;
        contaEmail.value = dados.email;
        contaSenha.value = "";

        painelConta.hidden = false;

        painelConta.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (erro) {
        alert(erro.message);
    }
}

// FECHAR MINHA CONTA
function fecharMinhaConta() {
    painelConta.hidden = true;
    formConta.reset();
}

// SALVAR ALTERAÇÕES DA CONTA
async function salvarMinhaConta(evento) {
    evento.preventDefault();

    const dados = {
        nome: contaNome.value.trim(),
        email: contaEmail.value.trim(),
        senha: contaSenha.value
    };

    btnSalvarConta.disabled = true;

    try {
        const resultado = await requisicao(
            "/auth/minha-conta",
            {
                method: "PUT",
                body: JSON.stringify(dados)
            }
        );

        usuario = resultado.usuario;

        localStorage.setItem(
            "ecotrack_usuario",
            JSON.stringify(usuario)
        );

        document.getElementById("usuarioLogado").textContent =
            `${usuario.nome} · ${
                usuario.perfil === "admin" ? "Administrador" : "Usuário"
            }`;

        fecharMinhaConta();

        mostrarMensagem(resultado.mensagem);

    } catch (erro) {
        alert(erro.message);

    } finally {
        btnSalvarConta.disabled = false;
    }
}

// INICIALIZAÇÃO
mudarModoAuth("login");

if (token && usuario) {
    mostrarAplicacao();
}
