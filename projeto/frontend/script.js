
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

// NAVEGAÇÃO ENTRE AS TELAS
document.querySelectorAll("[data-pagina]").forEach(botao => {
    botao.addEventListener("click", () => mostrarPagina(botao.dataset.pagina));
});

document.querySelectorAll("[data-ir]").forEach(botao => {
    botao.addEventListener("click", () => mostrarPagina(botao.dataset.ir));
});


formConta.addEventListener("submit", salvarMinhaConta);
document.getElementById("btnExcluirConta").addEventListener("click", excluirMinhaConta);
document.getElementById("formFeedback").addEventListener("submit", enviarFeedback);

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
            if (!usuario || !usuario.nome) {
                throw new Error("Login realizado, mas os dados do usuário não vieram corretamente da API. Confira a resposta de /auth/login.");
            }

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
    document.getElementById("usuarioLogado").hidden = false;

    const nome = usuario.nome || "Usuário";
    const perfil = usuario.perfil === "admin" ? "Administrador" : "Cliente";
    definirTexto("nomeTopo", nome.split(" ")[0]);
    definirTexto("nomeChip", nome);
    definirTexto("perfilChip", perfil);
    definirTexto("avatarTopo", nome.charAt(0).toUpperCase());
    definirTexto("avatarPerfil", nome.charAt(0).toUpperCase());
    definirTexto("perfilNomeExibido", nome);
    definirTexto("perfilTipoExibido", perfil);

    const ehAdmin = usuario.perfil === "admin";
    painelFormulario.hidden = !ehAdmin;
    document.getElementById("navSolicitacoes").hidden = !ehAdmin;
    document.getElementById("navFeedback").hidden = ehAdmin;
    document.getElementById("navMinhasSolicitacoes").hidden = ehAdmin;
    mostrarPagina("inicio");
    carregarPontos();
}

// EXIBE UMA DAS TELAS DA PLATAFORMA
function mostrarPagina(pagina) {
    const paginas = {
        inicio: document.getElementById("paginaInicio"),
        pontos: document.getElementById("paginaPontos"),
        perfil: document.getElementById("paginaPerfil"),
        feedback: document.getElementById("paginaFeedback"),
        solicitacoes: document.getElementById("paginaSolicitacoes"),
        minhasSolicitacoes: document.getElementById("paginaMinhasSolicitacoes")
    };

    if (!paginas[pagina] || (pagina === "solicitacoes" && usuario?.perfil !== "admin") || (pagina === "feedback" && usuario?.perfil === "admin") || (pagina === "minhasSolicitacoes" && usuario?.perfil === "admin")) {
        pagina = "inicio";
    }

    Object.entries(paginas).forEach(([nome, elemento]) => {
        elemento.hidden = nome !== pagina;
    });

   document.querySelectorAll("[data-pagina]").forEach(botao => {
        botao.classList.toggle("ativa", botao.dataset.pagina === pagina);
    });

    if (pagina === "perfil") {
        carregarDadosPerfil();
    }

    if (pagina === "pontos") carregarPontos();
    if (pagina === "solicitacoes") carregarSolicitacoes();
    if (pagina === "minhasSolicitacoes") carregarMinhasSolicitacoes();
}

// SAIR
function sair() {
    localStorage.removeItem("ecotrack_token");
    localStorage.removeItem("ecotrack_usuario");

    token = null;
    usuario = null;

    painelAuth.hidden = false;
    painelApp.hidden = true;

    const botaoUsuario = document.getElementById("usuarioLogado");
    botaoUsuario.textContent = "";
    botaoUsuario.hidden = true;

    formAuth.reset();

    campoBusca.value = "";
    filtroMaterial.value = "";

    mostrarMensagem("");
}

// ATUALIZA TEXTO DE FORMA SEGURA (evita falha caso o HTML esteja desatualizado)
function definirTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (!elemento) {
        console.warn(`EcoTrack: elemento #${id} não encontrado no index.html.`);
        return false;
    }
    elemento.textContent = texto ?? "";
    return true;
}

// MENSAGENS
function mostrarMensagem(texto, erro = false) {
    const elemento = document.getElementById("mensagem");
    if (!elemento) {
        console.warn("EcoTrack: elemento #mensagem não encontrado no index.html.");
        return;
    }
    elemento.textContent = texto ?? "";
    elemento.classList.toggle("erro", erro);
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
        definirTexto("totalPontos", pontos.length);

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

    definirTexto("tituloFormulario", "Editar ponto de coleta");

    definirTexto("btnSalvar", "Salvar alterações");

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

    definirTexto("tituloFormulario", "Cadastrar ponto");

    definirTexto("btnSalvar", "Cadastrar ponto");

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

// ABRIR PERFIL DO USUÁRIO
async function abrirMinhaConta() {
    mostrarPagina("perfil");
}

// CARREGAR DADOS DO PERFIL
async function carregarDadosPerfil() {
    try {
        const dados = await requisicao("/auth/minha-conta");
        contaNome.value = dados.nome;
        contaEmail.value = dados.email;
        contaSenha.value = "";
        definirTexto("perfilNomeExibido", dados.nome);
        definirTexto("perfilTipoExibido", dados.perfil === "admin" ? "Administrador" : "Cliente");
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
}

// LIMPAR CAMPO DE SENHA AO SAIR DO PERFIL
function fecharMinhaConta() {
    contaSenha.value = "";
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

        definirTexto("nomeTopo", usuario.nome.split(" ")[0]);
        definirTexto("nomeChip", usuario.nome);
        definirTexto("perfilChip", usuario.perfil === "admin" ? "Administrador" : "Cliente");
        definirTexto("avatarTopo", usuario.nome.charAt(0).toUpperCase());
        definirTexto("avatarPerfil", usuario.nome.charAt(0).toUpperCase());
        definirTexto("perfilNomeExibido", usuario.nome);

        fecharMinhaConta();

        mostrarMensagem(resultado.mensagem);

    } catch (erro) {
        alert(erro.message);

    } finally {
        btnSalvarConta.disabled = false;
    }
}

// ENVIO DE SUGESTÃO DE NOVO PONTO (CLIENTE)
async function enviarFeedback(evento) {
    evento.preventDefault();
    const botao = document.getElementById("btnEnviarFeedback");
    const status = document.getElementById("mensagemFeedback");
    const dados = {
        nome_ponto: document.getElementById("sugNome").value.trim(),
        endereco: document.getElementById("sugEndereco").value.trim(),
        cidade: document.getElementById("sugCidade").value.trim(),
        materiais: document.getElementById("sugMateriais").value.trim(),
        horario: document.getElementById("sugHorario").value.trim(),
        telefone: document.getElementById("sugTelefone").value.trim(),
        detalhes: document.getElementById("sugDetalhes").value.trim()
    };
    botao.disabled = true;
    try {
        const resultado = await requisicao("/solicitacoes", { method: "POST", body: JSON.stringify(dados) });
        document.getElementById("formFeedback").reset();
        status.textContent = resultado.mensagem;
        status.classList.remove("erro");
    } catch (erro) {
        status.textContent = erro.message;
        status.classList.add("erro");
    } finally { botao.disabled = false; }
}

// HISTÓRICO DO CLIENTE: a API retorna apenas registros do usuário autenticado.
async function carregarMinhasSolicitacoes() {
    const lista = document.getElementById("listaMinhasSolicitacoes");
    const status = document.getElementById("mensagemMinhasSolicitacoes");
    lista.replaceChildren();
    status.textContent = "Carregando seu histórico...";
    status.classList.remove("erro");
    try {
        const solicitacoes = await requisicao("/solicitacoes/minhas");
        status.textContent = `${solicitacoes.length} solicitação(ões) no seu histórico.`;
        if (!solicitacoes.length) {
            const vazio = document.createElement("p");
            vazio.className = "empty-state";
            vazio.textContent = "Você ainda não enviou sugestões. Quando enviar um ponto, poderá acompanhar o andamento por aqui.";
            lista.append(vazio);
            return;
        }
        solicitacoes.forEach(item => {
            const card = document.createElement("article");
            card.className = "ponto solicitacao-card";
            const titulo = document.createElement("h2");
            titulo.textContent = item.nome_ponto;
            const badge = document.createElement("span");
            badge.className = `etiqueta status-${item.status.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}`;
            badge.textContent = `Status: ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`;
            card.append(titulo, badge);
            adicionarTexto(card, "📍 Endereço: ", `${item.endereco}, ${item.cidade}`);
            adicionarTexto(card, "♻ Materiais: ", item.materiais);
            adicionarTexto(card, "🕒 Horário: ", item.horario);
            if (item.telefone) adicionarTexto(card, "☎ Telefone informado: ", item.telefone);
            if (item.detalhes) adicionarTexto(card, "ℹ Detalhes: ", item.detalhes);
            const data = item.criado_em ? new Date(item.criado_em).toLocaleString("pt-BR") : "Data não disponível";
            adicionarTexto(card, "📅 Enviada em: ", data);
            const orientacao = document.createElement("p");
            orientacao.className = "historico-nota";
            orientacao.textContent = item.status === "pendente"
                ? "Sua sugestão foi recebida e aguarda análise da equipe."
                : item.status === "em análise"
                    ? "A equipe está avaliando as informações enviadas."
                    : item.status === "aprovada"
                        ? "Sua sugestão foi aprovada pela equipe EcoTrack."
                        : "Sua sugestão foi recusada. Entre em contato com a equipe caso precise de mais informações.";
            card.append(orientacao);

            const acoes = document.createElement("div");
            acoes.className = "acoes-card historico-acoes";
            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.className = "danger-button";
            excluir.textContent = "Excluir solicitação";
            excluir.addEventListener("click", () => excluirMinhaSolicitacao(item.id));
            acoes.append(excluir);
            card.append(acoes);
            lista.append(card);
        });
    } catch (erro) {
        status.textContent = erro.message;
        status.classList.add("erro");
    }
}

// O cliente só pode excluir uma solicitação vinculada à própria conta.
async function excluirMinhaSolicitacao(id) {
    if (!confirm("Deseja realmente excluir esta solicitação do seu histórico? Esta ação não pode ser desfeita.")) return;
    const status = document.getElementById("mensagemMinhasSolicitacoes");
    try {
        await requisicao(`/solicitacoes/${id}`, { method: "DELETE" });
        status.textContent = "Solicitação excluída do seu histórico.";
        status.classList.remove("erro");
        await carregarMinhasSolicitacoes();
    } catch (erro) {
        status.textContent = erro.message;
        status.classList.add("erro");
    }
}

// PAINEL ADMINISTRATIVO: CONSULTAR SUGESTÕES E CONTATO DO SOLICITANTE
async function carregarSolicitacoes() {
    const lista = document.getElementById("listaSolicitacoes");
    const status = document.getElementById("mensagemSolicitacoes");
    lista.replaceChildren();
    status.textContent = "Carregando sugestões...";
    try {
        const solicitacoes = await requisicao("/solicitacoes");
        status.textContent = `${solicitacoes.length} sugestão(ões) recebida(s).`;
        if (!solicitacoes.length) {
            const vazio = document.createElement("p"); vazio.className = "empty-state"; vazio.textContent = "Ainda não há sugestões de novos pontos."; lista.append(vazio); return;
        }
        solicitacoes.forEach(item => {
            const card = document.createElement("article"); card.className = "ponto solicitacao-card";
            const titulo = document.createElement("h2"); titulo.textContent = item.nome_ponto;
            const badge = document.createElement("span"); badge.className = "etiqueta"; badge.textContent = `Status: ${item.status}`;
            card.append(titulo, badge);
            adicionarTexto(card, "📍 Endereço: ", `${item.endereco}, ${item.cidade}`);
            adicionarTexto(card, "♻ Materiais: ", item.materiais);
            adicionarTexto(card, "🕒 Horário: ", item.horario);
            if (item.telefone) adicionarTexto(card, "☎ Telefone do local: ", item.telefone);
            if (item.detalhes) adicionarTexto(card, "ℹ Detalhes: ", item.detalhes);
            const contato = document.createElement("div"); contato.className = "solicitante-info";
            const subtitulo = document.createElement("strong"); subtitulo.textContent = "Enviado por";
            contato.append(subtitulo);
            adicionarTexto(contato, "Nome: ", item.nome_usuario);
            const email = document.createElement("p"); email.append(document.createElement("strong")); email.firstChild.textContent = "E-mail: ";
            const link = document.createElement("a"); link.href = `mailto:${item.email_usuario}`; link.textContent = item.email_usuario; email.append(link); contato.append(email);
            card.append(contato);
            const acoes = document.createElement("div"); acoes.className = "acoes-card";
            const seletor = document.createElement("select");
            ["pendente", "em análise", "aprovada", "recusada"].forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v.charAt(0).toUpperCase() + v.slice(1); seletor.append(o); });
            seletor.value = item.status;
            const salvar = document.createElement("button"); salvar.className = "primario"; salvar.textContent = "Atualizar status";
            salvar.addEventListener("click", async () => {
                salvar.disabled = true;
                try { const r = await requisicao(`/solicitacoes/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: seletor.value }) }); status.textContent = r.mensagem; await carregarSolicitacoes(); }
                catch (e) { status.textContent = e.message; status.classList.add("erro"); salvar.disabled = false; }
            });
            acoes.append(seletor, salvar); card.append(acoes); lista.append(card);
        });
    } catch (erro) { status.textContent = erro.message; status.classList.add("erro"); }
}

// INICIALIZAÇÃO
mudarModoAuth("login");

if (token && usuario) {
    mostrarAplicacao();
}


// EXCLUSAO DEFINITIVA DA CONTA COM CONFIRMACAO DE SENHA
async function excluirMinhaConta() {
    const confirmacao = confirm("Tem certeza de que deseja excluir sua conta? Essa ação não pode ser desfeita.");
    if (!confirmacao) return;
    const senha = prompt("Para confirmar, informe sua senha atual:");
    if (senha === null) return;
    if (!senha.trim()) { alert("A senha é obrigatória para excluir a conta."); return; }

    const botao = document.getElementById("btnExcluirConta");
    botao.disabled = true;
    try {
        const resultado = await requisicao("/auth/minha-conta", {
            method: "DELETE",
            body: JSON.stringify({ senha })
        });
        alert(resultado.mensagem || "Conta excluída.");
        localStorage.removeItem("ecotrack_token");
        localStorage.removeItem("ecotrack_usuario");
        token = null;
        usuario = null;
        painelApp.hidden = true;
        painelAuth.hidden = false;
        formAuth.reset();
        mudarModoAuth("login");
    } catch (erro) {
        alert(erro.message);
    } finally {
        botao.disabled = false;
    }
}
