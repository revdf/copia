// JavaScript para Cadastro de Anúncios - Garoto Com Local
// Funcionalidades completas do sistema de cadastro

// Constantes globais
const SITE_NAME = "Garoto Com Local";
const AJAX_URL = "https://garotocomlocal.com.br/wp-admin/admin-ajax.php";
const CADASTRO_NONCE = "97682889f6";

// Array de telas para navegação
const STEPS = [
  "tela0",
  "tela1",
  "tela2",
  "tela4",
  "tela5",
  "tela6",
  "tela7",
  "tela8",
  "tela9",
  "tela10",
  "tela11",
  "tela12",
  "tela13",
  "tela14",
];

// Exceções para capitalização de nomes
const excecoes = ["de", "da", "do", "das", "dos", "e"];

// Campos obrigatórios na Tela 6
const requiredKeys = ["doc_frente", "doc_verso", "selfie", "video_verif"];

// Função para validar Tela 5
function validarTela5() {
  const old = document.getElementById("erro_tela5");
  if (old) old.remove();

  const campos = [
    "nome_completo",
    "cpf_cadastro",
    "nome_mae",
    "email_cad",
    "whats_cad",
  ];
  const faltando = campos.filter((id) => {
    const el = document.getElementById(id);
    return !el || !el.value.trim();
  });

  if (faltando.length) {
    const btn = document.getElementById("btn_proximo");
    const msg = document.createElement("div");
    msg.id = "erro_tela5";
    msg.className = "erro-campos";
    msg.textContent = "Preencha os dados acima para realizarmos seu cadastro";
    btn.insertAdjacentElement("afterend", msg);
    return;
  }

  mostrarTela6();
}

// Função para mostrar Tela 6
function mostrarTela6() {
  criarRascunhoAnunciante().then(() => {
    trocaTela("tela5", "tela6");
  });
}

// Função para criar rascunho do anunciante
function criarRascunhoAnunciante() {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("action", "criar_rascunho_anunciante");
    fd.append("nonce", CADASTRO_NONCE);
    fd.append("nome_completo", document.getElementById("nome_completo").value);
    fd.append("cpf", document.getElementById("cpf_cadastro").value);
    fd.append("email", document.getElementById("email_cad").value);
    fd.append("whats", document.getElementById("whats_cad").value);
    fd.append("nome_mae", document.getElementById("nome_mae").value);

    fetch(AJAX_URL, {
      method: "POST",
      body: fd,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          sessionStorage.setItem("draft_post_id", res.data.post_id);
          resolve();
        } else {
          alert(res.data?.msg || "Falha ao salvar rascunho.");
          reject();
        }
      })
      .catch(() => {
        alert("Erro de comunicação com o servidor.");
        reject();
      });
  });
}

// Função para mostrar Tela 7
async function mostrarTela7() {
  requiredKeys.forEach((id) => {
    const old = document.getElementById("err_" + id);
    if (old) old.remove();
  });

  const faltando = requiredKeys.filter((k) => !getSelectedFile(k));
  if (faltando.length) {
    const prev = document.getElementById("erro_tela6");
    if (prev) prev.remove();
    const msg = document.createElement("div");
    msg.id = "erro_tela6";
    msg.className = "erro-campos";
    msg.textContent =
      "Realize o upload das fotos e vídeo para continuarmos com seu cadastro";
    btnFinalizar.insertAdjacentElement("afterend", msg);
    return;
  }

  try {
    btnFinalizar.disabled = true;
    btnFinalizar.textContent = "Enviando…";

    // Valida tipos na Tela 6 (imagem onde é imagem, vídeo onde é vídeo)
    const errosTipo = [];

    // Campos que DEVEM ser imagem
    [
      ["doc_frente", "Documento (frente)"],
      ["doc_verso", "Documento (verso)"],
      ["selfie", "Selfie"],
    ].forEach(([key, label]) => {
      const f = getSelectedFile(key);
      if (!f || !isImageFile(f)) errosTipo.push(label);
    });

    // Campo que DEVE ser vídeo
    const vfile = getSelectedFile("video_verif");
    if (!vfile || !isVideoFile(vfile)) errosTipo.push("Vídeo de verificação");

    if (errosTipo.length) {
      const prev = document.getElementById("erro_tela6_tipos");
      if (prev) prev.remove();
      const msg = document.createElement("div");
      msg.id = "erro_tela6_tipos";
      msg.className = "erro-campos";
      msg.textContent =
        "Tipo de arquivo inválido em: " + errosTipo.join(", ") + ".";
      btnFinalizar.insertAdjacentElement("afterend", msg);
      return;
    }

    await uploadVerificacaoTodos();
    trocaTela("tela6", "tela7");
  } catch (err) {
    alert("Erro no upload de verificação: " + err);
  } finally {
    btnFinalizar.disabled = false;
    btnFinalizar.textContent = "Próximo";
  }
}

// Função para upload de verificação
async function uploadVerificacaoTodos() {
  const postId = sessionStorage.getItem("draft_post_id");
  if (!postId) throw "ID do rascunho não encontrado";

  const mapeamento = [
    { field: "doc_frente", tipo: "documento" },
    { field: "doc_verso", tipo: "documento-verso" },
    { field: "selfie", tipo: "selfie" },
    { field: "video_verif", tipo: "video" },
  ];

  const uploads = mapeamento.map(({ field, tipo }) => {
    const file = getSelectedFile(field);
    if (!file) return Promise.resolve();

    const fd = new FormData();
    fd.append("action", "upload_verificacao");
    fd.append("post_id", postId);
    fd.append("tipo", tipo);
    fd.append("file", file);
    fd.append("nonce", CADASTRO_NONCE);

    return fetch(AJAX_URL, {
      method: "POST",
      body: fd,
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw json.data || `Erro upload ${tipo}`;
        console.log(`✔ ${tipo}: ${json.data}`);
      });
  });

  await Promise.all(uploads);
}

// Função para finalizar cadastro com prioridade
function finalizarCadastroPrioridade() {
  mostrarTela8();
}

// Função para mostrar Tela 8
function mostrarTela8() {
  trocaTela("tela7", "tela8");
}

// Função para mostrar Tela 9
function mostrarTela9() {
  trocaTela("tela8", "tela9");
}

// Função para prosseguir depois das diretrizes
function prosseguirDepoisDiretrizes() {
  mostrarTela9();
}

// Função para salvar Tela 9
function salvarTela9() {
  const btn = document.getElementById("btn_salvar9");
  ["erro_tela9", "erro_banner"].forEach((id) => {
    const old = document.getElementById(id);
    if (old) old.remove();
  });

  const texto = document.getElementById("descricao_perfil").value.trim();
  if (!texto) {
    const msg = document.createElement("div");
    msg.id = "erro_tela9";
    msg.className = "erro-campos";
    msg.textContent = "Preencha os dados acima para realizarmos seu cadastro";
    btn.insertAdjacentElement("afterend", msg);
    return;
  }

  const bannerInput = document.getElementById("banner_capa");
  if (!bannerInput.files.length) {
    const msg = document.createElement("div");
    msg.id = "erro_banner";
    msg.className = "erro-campos";
    msg.textContent =
      "Faça o upload da imagem de capa para continuarmos com seu cadastro";
    btn.insertAdjacentElement("afterend", msg);
    return;
  }

  // Garanta que a capa seja IMAGEM
  const bannerFile = bannerInput.files[0];
  if (!isImageFile(bannerFile)) {
    document.getElementById("erro_banner_tipo")?.remove();
    const msg = document.createElement("div");
    msg.id = "erro_banner_tipo";
    msg.className = "erro-campos";
    msg.textContent = "A imagem de capa deve ser uma IMAGEM (jpg, png, webp).";
    btn.insertAdjacentElement("afterend", msg);
    return;
  }

  const postId = sessionStorage.getItem("draft_post_id");
  if (!postId) {
    alert(
      "Não foi possível identificar o rascunho. Volte uma etapa e tente novamente."
    );
    return;
  }

  const fd = new FormData();
  fd.append("action", "salvar_tela9");
  fd.append("nonce", CADASTRO_NONCE);
  fd.append("post_id", postId);
  fd.append("descricao", texto);
  fd.append("banner", bannerInput.files[0]);

  fetch(AJAX_URL, {
    method: "POST",
    body: fd,
  })
    .then((r) => r.json())
    .then((json) => {
      if (!json.success) {
        alert(json.data?.msg || "Erro ao salvar a Tela 9.");
        return;
      }
      mostrarTela10();
    })
    .catch((err) => {
      console.error(err);
      alert("Falha na comunicação. Tente novamente.");
    });
}

// Função para mostrar Tela 10
function mostrarTela10() {
  trocaTela("tela9", "tela10");
}

// Função para salvar Tela 10
function salvarTela10() {
  const btn = document.getElementById("btn_salvar10");
  document.getElementById("erro_tela10_tipo")?.remove();
  const prev = document.getElementById("erro_tela10");
  if (prev) prev.remove();

  const faltando = ["foto1", "foto2", "foto3", "foto4", "foto5"].filter(
    (id) => {
      const inp = document.getElementById(id);
      return !(inp && inp.files.length);
    }
  );

  if (faltando.length) {
    const msg = document.createElement("div");
    msg.id = "erro_tela10";
    msg.className = "erro-campos";
    msg.textContent =
      "Faça o upload de todas as 5 fotos para continuarmos com seu cadastro";
    btn.insertAdjacentElement("afterend", msg);
    return;
  }

  // Confere TIPOS (tem que ser imagem)
  const invalidas = [];
  for (let i = 1; i <= 5; i++) {
    const f = document.getElementById("foto" + i).files[0];
    if (!isImageFile(f)) invalidas.push("foto " + i);
  }

  if (invalidas.length) {
    const msg = document.createElement("div");
    msg.id = "erro_tela10_tipo";
    msg.className = "erro-campos";
    msg.textContent = "Envie apenas IMAGENS nas " + invalidas.join(", ") + ".";
    btn.insertAdjacentElement("afterend", msg);
    return;
  }

  mostrarTela11();
}

// Função para mostrar Tela 11
function mostrarTela11() {
  mostrarTela13("Enviando fotos do anúncio...");
  uploadGallery()
    .then(() => {
      esconderTela13();
      trocaTela("tela10", "tela11");
    })
    .catch((err) => {
      esconderTela13();
      alert("Falha ao enviar as fotos: " + err.message);
    });
}

// Função para upload da galeria
async function uploadGallery() {
  const postId = sessionStorage.getItem("draft_post_id");
  for (let i = 1; i <= 5; i++) {
    const input = document.getElementById("foto" + i);
    if (input && input.files && input.files[0]) {
      const fd = new FormData();
      fd.append("action", "upload_gallery");
      fd.append("nonce", CADASTRO_NONCE);
      fd.append("post_id", postId);
      fd.append("index", i);
      fd.append("file", input.files[0]);

      const r = await fetch(AJAX_URL, {
        method: "POST",
        body: fd,
      });
      const json = await r.json();
      if (!json.success)
        throw new Error(json.data || "Erro no upload da foto " + i);

      const label = document.getElementById("name_foto" + i);
      if (label) label.textContent = input.files[0].name;
    }
  }
}

// Função para mostrar Tela 12
function mostrarTela12() {
  trocaTela("tela11", "tela12");
}

// Função para voltar para Tela 11
function voltarParaTela11() {
  trocaTela("tela12", "tela11");
}

// Função para aceitar termos
function aceitarTermos() {
  sessionStorage.setItem("aceitou_termos", "1");
  finalizarFormulario();
}

// Função para não aceitar termos
function naoAceitoTermos() {
  sessionStorage.removeItem("aceitou_termos");
  alert("Sem aceitar os termos não podemos concluir o cadastro.");
  voltarParaTela11();
}

// Função para finalizar formulário
async function finalizarFormulario() {
  mostrarTela13("Enviando seus dados, aguarde…");

  const fd = new FormData();
  fd.append("action", "finalizar_cadastro");
  fd.append("nonce", CADASTRO_NONCE);
  fd.append("post_id", sessionStorage.getItem("draft_post_id"));
  fd.append("nome_completo", document.getElementById("nome_completo").value);
  fd.append("cpf", document.getElementById("cpf_cadastro").value);
  fd.append("nome_mae", document.getElementById("nome_mae").value);
  fd.append("email", document.getElementById("email_cad").value);
  fd.append("whats", document.getElementById("whats_cad").value);
  fd.append("prioridade", document.getElementById("prioridade").value);
  fd.append("descricao", document.getElementById("descricao_perfil").value);
  fd.append("nome_prof", document.getElementById("nome_profissional").value);
  fd.append("endereco_completo", enderecoFormatado());

  let json;
  try {
    const resp = await fetch(AJAX_URL, {
      method: "POST",
      body: fd,
    });
    json = await resp.json();

    if (!json.success) {
      atualizarMensagemTela13(json.data.msg || "Erro ao finalizar cadastro.");
      alert(json.data.msg || "Erro ao finalizar cadastro.");
      return;
    }

    preencherTela14(json);
    atualizarMensagemTela13("Cadastro enviado com sucesso! Quase lá…");
    setTimeout(() => trocaTela("tela13", "tela14"), 1000);
  } catch (err) {
    console.error("🛑 erro em finalizarFormulario():", err);
    console.error("Resposta bruta do JSON:", json);
    atualizarMensagemTela13(
      "Falha na comunicação. Veja console para detalhes."
    );
    alert("Falha na comunicação. Veja console para detalhes.");
  }
}

// Função para preencher Tela 14
function preencherTela14(res) {
  const prioridadeSel =
    document.getElementById("prioridade")?.value || "gratis";
  const prioridadeTxt =
    prioridadeSel === "destaque"
      ? "Anunciar em Destaque - análise em até 24h úteis"
      : "Anunciar grátis - análise em até 03 dias úteis";

  const cpfRaw = document.getElementById("cpf_cadastro").value;
  const cpf = cpfRaw.replace(/\D/g, "");
  const msg = `Olá, Equipe *${SITE_NAME}*. Desejo finalizar meu cadastro, meu CPF é: *${cpf}* .`;
  const waURL = `https://wa.me/5541991835271?text=${encodeURIComponent(msg)}`;

  document.getElementById("t14_msg").textContent = msg;
  document.getElementById("t14_btn_whats").href = waURL;
}

// Função para copiar mensagem da Tela 14
function copiarMsg14() {
  const txt = document.getElementById("t14_msg").textContent;
  navigator.clipboard
    .writeText(txt)
    .then(() => {
      alert("Mensagem copiada!");
    })
    .catch(() => {
      alert(
        "Não foi possível copiar automaticamente. Selecione e copie manualmente."
      );
    });
}

// Função para mostrar Tela 13
function mostrarTela13(msg) {
  if (msg) document.getElementById("tela13_msg").textContent = msg;
  const stepAtual = sessionStorage.getItem("wizard_step") || "tela1";
  sessionStorage.setItem("tela_voltar_depois_processar", stepAtual);
  trocaTela(stepAtual, "tela13");
}

// Função para atualizar mensagem da Tela 13
function atualizarMensagemTela13(msg) {
  document.getElementById("tela13_msg").textContent = msg;
}

// Função para esconder Tela 13
function esconderTela13() {
  const back =
    sessionStorage.getItem("tela_voltar_depois_processar") || "tela1";
  trocaTela("tela13", back);
  sessionStorage.removeItem("tela_voltar_depois_processar");
}

// Função para atualizar nome profissional
async function updateProfessionalName() {
  const btn = document.getElementById("btn_nome_prof");
  const nome = document.getElementById("nome_profissional").value.trim();

  if (!nome) {
    document.getElementById("erro_nome_prof").style.display = "block";
    return;
  }

  if (!isEnderecoValido()) {
    mostrarErroEndereco(true);
    (document.getElementById("endereco_bairro_txt") || {}).focus?.();
    return;
  }

  const endereco = enderecoFormatado();
  btn.disabled = true;
  btn.textContent = "Salvando…";

  try {
    const postId = sessionStorage.getItem("draft_post_id");
    const fd = new FormData();
    fd.append("action", "update_professional_name");
    fd.append("nonce", CADASTRO_NONCE);
    fd.append("post_id", postId);
    fd.append("nome_profissional", nome);
    fd.append("endereco_formatado", endereco);

    const resp = await fetch(AJAX_URL, {
      method: "POST",
      body: fd,
    });
    const json = await resp.json();

    if (!json.success) throw new Error(json.data || "Erro desconhecido");

    document.getElementById("erro_nome_prof").style.display = "none";
    mostrarErroEndereco(false);
    mostrarTela12();
  } catch (err) {
    alert("Falha ao salvar nome profissional: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Próximo";
  }
}

// Função para verificar se endereço é válido
function isEnderecoValido() {
  const bairro = (
    document.getElementById("endereco_bairro_txt").value || ""
  ).trim();
  const cidade = (
    document.getElementById("endereco_cidade_txt").value || ""
  ).trim();
  return !!(bairro && cidade);
}

// Função para mostrar erro de endereço
function mostrarErroEndereco(mostrar = true) {
  const erro = document.getElementById("erro_endereco");
  if (erro) erro.style.display = mostrar ? "block" : "none";
}

// Função para formatar endereço
function enderecoFormatado() {
  const rua = (document.getElementById("endereco_rua_txt").value || "").trim();
  const bairro = (
    document.getElementById("endereco_bairro_txt").value || ""
  ).trim();
  const cidade = (
    document.getElementById("endereco_cidade_txt").value || ""
  ).trim();

  if (!bairro || !cidade) return "";
  return rua ? `${rua}, ${bairro}-${cidade}` : `${bairro}-${cidade}`;
}

// Função para capitalização de nomes
function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s\-'])(\p{L})/gu, (m, sep, letra) =>
      excecoes.includes(m.trim().toLowerCase()) ? m : sep + letra.toUpperCase()
    )
    .trim();
}

// Função para validar CPF
function validaCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0,
    resto;
  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.substring(10, 11));
}

// Função para aplicar máscara no CPF
function mascaraCPF(v) {
  v = (v || "").replace(/\D/g, "").slice(0, 11);
  return v.length === 11
    ? v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : v;
}

// Função para verificar se é arquivo de imagem
function isImageFile(f) {
  if (!f) return false;
  const type = (f.type || "").toLowerCase();
  if (type.startsWith("image/")) return true;
  const name = (f.name || "").toLowerCase();
  return /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif)$/.test(name);
}

// Função para verificar se é arquivo de vídeo
function isVideoFile(f) {
  if (!f) return false;
  const type = (f.type || "").toLowerCase();
  if (type.startsWith("video/")) return true;
  const name = (f.name || "").toLowerCase();
  return /\.(mp4|mov|mkv|webm|avi)$/.test(name);
}

// Função para abrir câmera
function abrirCamera(key, facing = "environment", isVideo = false) {
  const input = document.getElementById(`${key}_camera`);
  if (!input) return;
  input.setAttribute("capture", facing);
  input.click();
}

// Função para abrir galeria
function abrirGaleria(key, isVideo = false) {
  const input = document.getElementById(`${key}_gallery`);
  if (!input) return;
  input.click();
}

// Função para obter arquivo selecionado
function getSelectedFile(key) {
  const cam = document.getElementById(`${key}_camera`);
  const gal = document.getElementById(`${key}_gallery`);
  return (
    (cam && cam.files && cam.files[0]) ||
    (gal && gal.files && gal.files[0]) ||
    null
  );
}

// Função para atualizar nome do arquivo
function atualizarNomeArquivo(key, spanId) {
  const f = getSelectedFile(key);
  const span = document.getElementById(spanId);
  if (span) span.textContent = f ? f.name : "Nenhum arquivo escolhido";
}

// Função para trocar entre telas
function trocaTela(saida, entrada) {
  STEPS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  document.getElementById(entrada).style.display = "block";
  sessionStorage.setItem("wizard_step", entrada);
  salvarEstado();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Função para salvar estado
function salvarEstado() {
  const data = {};
  document
    .querySelectorAll(
      '#tela1 input:not([type="file"]), ' +
        '#tela2 input:not([type="file"]), ' +
        '#tela4 input:not([type="file"]), ' +
        '#tela5 input:not([type="file"]), ' +
        '#tela6 input:not([type="file"]), ' +
        "#tela7 select, " +
        '#tela8 input:not([type="file"]), ' +
        '#tela9 input:not([type="file"]), ' +
        "#tela9 textarea, " +
        '#tela10 input:not([type="file"]), ' +
        '#tela11 input:not([type="file"]), ' +
        "#tela11 textarea, " +
        "#tela11 select, " +
        '#tela12 input:not([type="file"]), ' +
        "#tela12 textarea"
    )
    .forEach((el) => {
      if (el.id) data[el.id] = el.value;
    });
  sessionStorage.setItem("wizard_data", JSON.stringify(data));
}

// Função para restaurar wizard
function restaurarWizard() {
  const step = sessionStorage.getItem("wizard_step") || "tela0";
  STEPS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  const atual =
    document.getElementById(step) || document.getElementById("tela1");
  if (atual) atual.style.display = "block";
  const saved = JSON.parse(sessionStorage.getItem("wizard_data") || "{}");
  delete saved["nome_profissional"];
  Object.keys(saved).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === "INPUT" && el.type === "file") return;
    el.value = saved[id];
  });
  if (step === "tela5") {
    const cpfCad = document.getElementById("cpf_cadastro");
    if (cpfCad && cpfCad.value) {
      cpfCad.dispatchEvent(new Event("blur"));
    }
  }
  sessionStorage.setItem("wizard_step", step);
}

// Função para máscara de telefone
function mascaraTelefone(v) {
  v = v.replace(/\D/g, "").slice(0, 11);
  if (v.length > 7) {
    v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1)$2-$3");
  } else if (v.length > 2) {
    v = v.replace(/(\d{2})(\d{0,5})/, "($1)$2");
  } else if (v.length > 0) {
    v = v.replace(/(\d{0,2})/, "($1");
  }
  return v;
}

// Função para verificar dados
async function verificarDados() {
  const cpfEl = document.getElementById("cpf_verif");
  const emailEl = document.getElementById("email");
  const telefoneEl = document.getElementById("telefone");
  const resultado = document.getElementById("resultado-verificacao");
  const cpf = cpfEl.value.trim();
  const email = emailEl.value.trim();
  const telefone = telefoneEl.value.trim();
  const telefoneDigits = telefone.replace(/\D/g, "").slice(0, 11);

  resultado.innerHTML = "";

  function listaCampos(arr) {
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr.join(" e ");
    return arr.slice(0, -1).join(", ") + " e " + arr.slice(-1);
  }

  const faltando = [];
  if (!cpf) faltando.push("CPF");
  if (!email) faltando.push("e-mail");
  if (!telefone) faltando.push("WhatsApp");

  if (faltando.length) {
    resultado.innerHTML = `<p class="erro-campos">Preencha seu ${listaCampos(
      faltando
    )} para continuarmos com a validação.</p>`;
    return;
  }

  resultado.innerHTML = '<span style="color:#000;">Analisando dados...</span>';

  try {
    const data = new FormData();
    data.append("action", "verificar_anunciante");
    data.append("cpf", cpf);
    data.append("email", email);
    data.append("telefone", telefoneDigits);
    data.append("nonce", CADASTRO_NONCE);

    const r = await fetch(AJAX_URL, {
      method: "POST",
      body: data,
    });

    const res = await r.json();

    if (!res.ok) {
      resultado.innerHTML = `<p style="color:#dc3545;font-weight:bold">${
        res.msg || "Erro de validação."
      }</p>`;
      return;
    }

    if (res.resume && res.post_id) {
      try {
        sessionStorage.setItem("draft_post_id", String(res.post_id));
      } catch (e) {}
      setTimeout(mostrarTela5, 100);
      return;
    }

    if (res.existe) {
      resultado.innerHTML = `
                <p style="color:red;"><strong>Você já possui um anúncio.</strong><br>Favor entrar em contato conosco via WhatsApp.</p>
                <a href="https://wa.me/5541991835271" class="btn-success">Chamar no WhatsApp</a>`;
      return;
    }

    setTimeout(mostrarTela5, 200);
  } catch (err) {
    resultado.innerHTML = `<p class="erro-campos">Falha ao validar. Tente novamente.</p>`;
  }
}

// Função para mostrar Tela 5
function mostrarTela5() {
  const cpfVerif = document.getElementById("cpf_verif").value.trim();
  const emailVerif = document.getElementById("email").value.trim();
  const telVerif = document.getElementById("telefone").value.trim();
  const cpfCad = document.getElementById("cpf_cadastro");
  const emailCad = document.getElementById("email_cad");
  const whatsCad = document.getElementById("whats_cad");

  if (!cpfCad.value) cpfCad.value = mascaraCPF(cpfVerif);
  if (!emailCad.value) emailCad.value = emailVerif;
  if (!whatsCad.value) whatsCad.value = telVerif;
  cpfCad.dispatchEvent(new Event("blur"));

  trocaTela("tela4", "tela5");
}





