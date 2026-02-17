#!/usr/bin/env node

// Script para integrar dados da página modelo 02 na página modelo 01
// Mantendo o layout e estilo da página modelo 01

console.log('🔄 INTEGRANDO DADOS DA PÁGINA MODELO 02 NA PÁGINA MODELO 01');
console.log('========================================================');

// Dados de exemplo baseados na página modelo 02
const dadosExemplo = {
    nome: "Quadrado 14 (N1-2)",
    dataAtualizacao: "22/10/2025",
    precos: {
        "1 hora": "R$ 200",
        "2 horas": "R$ 350"
    },
    descricao: "Profissional experiente com 5 anos de atuação. Especializado em massagem relaxante e terapêutica. Ambiente acolhedor e seguro para seu total conforto. Atendo 24h com muito carinho e dedicação.",
    informacoesPessoais: {
        idade: "25",
        altura: "1.70m",
        peso: "65kg",
        fazOralSem: "Sim",
        beija: "Sim",
        fazAnal: "Sim",
        moraSo: "Sim",
        local: "São Paulo, SP",
        atende: "24h",
        horarioAtendimento: "24h",
        formasPagamento: "Dinheiro PIX Débito Crédito"
    },
    informacoesAdicionais: {
        sobreMim: "Profissional experiente, atenciosa e dedicada ao seu bem-estar",
        aparencia: "Morena, cabelos longos, olhos castanhos",
        etnia: "Parda",
        idiomas: "Português, Inglês básico",
        nacionalidade: "Brasileira"
    },
    servicosBasicos: [
        "Beijos na boca",
        "Oral com camisinha",
        "Oral sem camisinha",
        "Oral até o final",
        "Sexo anal",
        "Garganta profunda",
        "Massagem erótica",
        "Namoradinha"
    ],
    servicosEspeciais: [
        "Beijo negro",
        "Beijo branco",
        "Ejaculação facial",
        "Ejaculação corpo",
        "Chuva dourada",
        "Cubana",
        "PSE",
        "Face fucking"
    ],
    fetichismoBDSM: [
        "Fetichismo",
        "Sado submissa",
        "Sado dominadora",
        "Sado suave",
        "Sado duro",
        "Fisting Anal",
        "Brinquedos sexuais",
        "Lingerie"
    ],
    atendimentoGrupo: [
        "Atenção à casais",
        "Duplas",
        "Trios",
        "Orgia",
        "Festas e eventos",
        "Despedida de solteiro"
    ],
    perfilEstilo: [
        "Ativa",
        "Passiva",
        "Versátil",
        "Inversão de papéis",
        "Lésbica",
        "Atenção à mulheres",
        "Experta principiantes",
        "Atenção à deficientes físicos"
    ],
    servicosExtras: [
        "Fantasias e figurinos",
        "Sem limite",
        "Sexcam"
    ]
};

// Função para gerar HTML das informações pessoais
function gerarHTMLInformacoesPessoais(dados) {
    return `
        <div class="info-item">
            <span class="info-label">Idade:</span>
            <span class="info-value">${dados.idade}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Altura:</span>
            <span class="info-value">${dados.altura}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Peso:</span>
            <span class="info-value">${dados.peso}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Faz Oral sem:</span>
            <span class="info-value">${dados.fazOralSem}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Beija:</span>
            <span class="info-value">${dados.beija}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Faz Anal:</span>
            <span class="info-value">${dados.fazAnal}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Mora só:</span>
            <span class="info-value">${dados.moraSo}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Local:</span>
            <span class="info-value">${dados.local}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Atende:</span>
            <span class="info-value">${dados.atende}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Horário de Atendimento:</span>
            <span class="info-value">${dados.horarioAtendimento}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Formas de Pagamento:</span>
            <span class="info-value">${dados.formasPagamento}</span>
        </div>
    `;
}

// Função para gerar HTML dos serviços
function gerarHTMLServicos(servicos, titulo) {
    const servicosHTML = servicos.map(servico => 
        `<li><i class="fas fa-check"></i> ${servico}</li>`
    ).join('');
    
    return `
        <div class="services-section">
            <h5>${titulo}</h5>
            <ul class="services-list">
                ${servicosHTML}
            </ul>
        </div>
    `;
}

// Função para gerar HTML das informações adicionais
function gerarHTMLInformacoesAdicionais(dados) {
    return `
        <div class="info-item">
            <span class="info-label">Sobre Mim:</span>
            <span class="info-value">${dados.sobreMim}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Aparência:</span>
            <span class="info-value">${dados.aparencia}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Etnia:</span>
            <span class="info-value">${dados.etnia}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Idiomas:</span>
            <span class="info-value">${dados.idiomas}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Nacionalidade:</span>
            <span class="info-value">${dados.nacionalidade}</span>
        </div>
    `;
}

// Função para gerar HTML dos preços
function gerarHTMLPrecos(precos) {
    return Object.entries(precos).map(([tempo, valor]) => 
        `<li><span>${tempo}: ${valor}</span></li>`
    ).join('');
}

console.log('✅ Dados preparados para integração');
console.log('📋 Nome:', dadosExemplo.nome);
console.log('💰 Preços:', Object.keys(dadosExemplo.precos).length, 'opções');
console.log('📝 Descrição:', dadosExemplo.descricao.length, 'caracteres');
console.log('👤 Informações pessoais:', Object.keys(dadosExemplo.informacoesPessoais).length, 'campos');
console.log('🔧 Serviços básicos:', dadosExemplo.servicosBasicos.length, 'itens');
console.log('⭐ Serviços especiais:', dadosExemplo.servicosEspeciais.length, 'itens');

// Exportar dados para uso na página
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        dadosExemplo,
        gerarHTMLInformacoesPessoais,
        gerarHTMLServicos,
        gerarHTMLInformacoesAdicionais,
        gerarHTMLPrecos
    };
}

console.log('🎉 Script de integração concluído!');
