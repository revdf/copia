#!/usr/bin/env node

// Script para adicionar fotos da pasta "teste" ao sistema
// Específico para a página modelo 01

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001/api/advertisements';
const PHOTOS_DIR = path.join(__dirname, 'frontend', 'src', 'fotinha', 'fotos');
const TEST_PHOTOS_DIR = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop', 'teste');

// Dados de exemplo baseados na página modelo 02
const dadosExemplo = {
    nome: "Quadrado 14 (N1-2)",
    idade: 25,
    cidade: "São Paulo",
    estado: "SP",
    categoria: "premium",
    descricao: "Profissional experiente com 5 anos de atuação. Especializado em massagem relaxante e terapêutica. Ambiente acolhedor e seguro para seu total conforto. Atendo 24h com muito carinho e dedicação.",
    preco: 200,
    nivel: "N1",
    status: "active",
    informacoesPessoais: {
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

// Função para verificar se o backend está rodando
async function checkBackendStatus() {
    try {
        await axios.head(API_URL);
        return true;
    } catch (error) {
        return false;
    }
}

// Função para copiar foto da pasta teste para o projeto
function copyPhotoToProject(photoFileName) {
    const sourcePath = path.join(TEST_PHOTOS_DIR, photoFileName);
    const destPath = path.join(PHOTOS_DIR, photoFileName);
    
    try {
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ Foto copiada: ${photoFileName}`);
            return true;
        } else {
            console.error(`❌ Foto não encontrada: ${sourcePath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro ao copiar foto ${photoFileName}:`, error.message);
        return false;
    }
}

// Função para adicionar um anúncio com dados completos
async function addAdvertisementWithCompleteData(photoFileName) {
    try {
        // Copiar foto para o projeto
        if (!copyPhotoToProject(photoFileName)) {
            return null;
        }

        // Gerar nome baseado no arquivo da foto
        const baseName = path.basename(photoFileName, path.extname(photoFileName));
        const nome = baseName.replace(/[-_.]/g, ' ').trim() || "Modelo Teste";

        // Criar dados do anúncio com informações completas
        const adData = {
            name: nome,
            age: dadosExemplo.idade,
            city: dadosExemplo.cidade,
            state: dadosExemplo.estado,
            category: dadosExemplo.categoria,
            description: dadosExemplo.descricao,
            price: dadosExemplo.preco,
            photo_capa: `fotinha/fotos/${photoFileName}`,
            photos: [`fotinha/fotos/${photoFileName}`],
            videos: [],
            whatsapp: '55119' + Math.floor(100000000 + Math.random() * 900000000),
            instagram: `@${nome.toLowerCase().replace(/\s/g, '')}`,
            level: dadosExemplo.nivel,
            status: dadosExemplo.status,
            
            // Informações pessoais detalhadas
            informacoesPessoais: dadosExemplo.informacoesPessoais,
            informacoesAdicionais: dadosExemplo.informacoesAdicionais,
            
            // Serviços organizados por categoria
            servicosBasicos: dadosExemplo.servicosBasicos,
            servicosEspeciais: dadosExemplo.servicosEspeciais,
            fetichismoBDSM: dadosExemplo.fetichismoBDSM,
            atendimentoGrupo: dadosExemplo.atendimentoGrupo,
            perfilEstilo: dadosExemplo.perfilEstilo,
            servicosExtras: dadosExemplo.servicosExtras,
            
            // Preços detalhados
            precos: {
                "1 hora": "R$ 200",
                "2 horas": "R$ 350"
            },
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const response = await axios.post(API_URL, adData);
        console.log(`✅ Anúncio ${nome} adicionado com sucesso! ID: ${response.data.id}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Erro ao adicionar anúncio:`, error.message);
        if (error.response) {
            console.error('Detalhes do erro:', error.response.data);
        }
        return null;
    }
}

async function main() {
    console.log("🚀 ADICIONANDO FOTOS DA PASTA TESTE COM DADOS COMPLETOS");
    console.log("======================================================");

    const backendRunning = await checkBackendStatus();
    if (!backendRunning) {
        console.log("❌ Backend não está rodando na porta 5001");
        console.log("💡 Inicie o backend primeiro: cd backend && node server.js");
        console.log("\n🔄 Execute este script novamente após iniciar o backend");
        return;
    }
    console.log("✅ Backend está funcionando!");

    // Verificar se a pasta de fotos existe
    if (!fs.existsSync(PHOTOS_DIR)) {
        console.log("📁 Criando pasta de fotos...");
        fs.mkdirSync(PHOTOS_DIR, { recursive: true });
    }

    // Listar fotos na pasta 'teste'
    if (!fs.existsSync(TEST_PHOTOS_DIR)) {
        console.log("❌ Pasta 'teste' não encontrada na área de trabalho.");
        console.log("💡 Crie a pasta 'teste' na sua área de trabalho e adicione fotos lá.");
        return;
    }

    const testPhotos = fs.readdirSync(TEST_PHOTOS_DIR).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });

    if (testPhotos.length === 0) {
        console.log("ℹ️ Nenhuma foto encontrada na pasta 'teste' na área de trabalho.");
        return;
    }

    console.log(`📋 Encontradas ${testPhotos.length} fotos na pasta 'teste'`);
    console.log("📋 Preparando dados dos anúncios com informações completas...");
    
    const newAds = [];

    for (const photo of testPhotos) {
        console.log(`\n📝 Processando: ${photo}`);
        const ad = await addAdvertisementWithCompleteData(photo);
        if (ad) {
            newAds.push(ad);
        }
    }

    console.log("\n🎉 Processo concluído!");
    console.log(`📊 Total de ${newAds.length} novos anúncios adicionados com dados completos.`);

    // Verificar o total de anúncios no banco
    try {
        const response = await axios.get(API_URL);
        console.log(`📈 Total de anúncios no banco: ${response.data.length}`);
    } catch (error) {
        console.error("❌ Erro ao verificar total de anúncios:", error.message);
    }

    console.log("\n🌐 Agora você pode testar a página modelo 01:");
    console.log("http://localhost:8080/A_02__premium_Anuncio_modelo_01.html");
}

main().catch(console.error);
