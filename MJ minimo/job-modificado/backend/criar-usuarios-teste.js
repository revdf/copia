// Script para criar usuários de teste no Firebase
// Este script cria usuários para testar o sistema de cadastro

const admin = require("firebase-admin");
require('dotenv').config({ path: './config-firebase-only.env' });

// Inicializar Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Lista de usuários de teste
const usuariosTeste = [
  {
    nomeCompleto: "Ana Silva",
    email: "ana.silva@teste.com",
    telefone: "+5511999999001",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Bruno Santos",
    email: "bruno.santos@teste.com",
    telefone: "+5511999999002",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Camila Oliveira",
    email: "camila.oliveira@teste.com",
    telefone: "+5511999999003",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Diego Costa",
    email: "diego.costa@teste.com",
    telefone: "+5511999999004",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Elena Ferreira",
    email: "elena.ferreira@teste.com",
    telefone: "+5511999999005",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Fernando Lima",
    email: "fernando.lima@teste.com",
    telefone: "+5511999999006",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Gabriela Souza",
    email: "gabriela.souza@teste.com",
    telefone: "+5511999999007",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Henrique Alves",
    email: "henrique.alves@teste.com",
    telefone: "+5511999999008",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "Isabela Rocha",
    email: "isabela.rocha@teste.com",
    telefone: "+5511999999009",
    role: "advertiser",
    status: "active"
  },
  {
    nomeCompleto: "João Pereira",
    email: "joao.pereira@teste.com",
    telefone: "+5511999999010",
    role: "advertiser",
    status: "active"
  }
];

// Função para criar usuário
async function criarUsuario(usuario, index) {
  try {
    // Criar documento do usuário no Firestore
    const docRef = await db.collection('usuarios').add({
      ...usuario,
      environment: "test",
      project: "copia-do-job",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      verificado: true,
      ultimoLogin: admin.firestore.FieldValue.serverTimestamp(),
      totalAnuncios: Math.floor(Math.random() * 5) + 1,
      nivelAcesso: "usuario"
    });
    
    console.log(`✅ Usuário ${index + 1}: ${usuario.nomeCompleto} - ${usuario.email} (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Erro ao criar usuário ${index + 1}:`, error.message);
    return null;
  }
}

// Função principal
async function criarUsuarios() {
  console.log("🚀 Criando usuários de teste...");
  console.log(`📊 Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🌍 Ambiente: ${process.env.ENVIRONMENT}`);
  console.log("");
  
  let totalCriados = 0;
  const idsCriados = [];
  
  for (let i = 0; i < usuariosTeste.length; i++) {
    const id = await criarUsuario(usuariosTeste[i], i);
    if (id) {
      idsCriados.push(id);
      totalCriados++;
    }
    
    // Pequena pausa para não sobrecarregar o Firebase
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log("");
  console.log("🎉 USUÁRIOS CRIADOS COM SUCESSO!");
  console.log(`📊 Total de usuários criados: ${totalCriados}`);
  console.log("");
  console.log("📋 Usuários criados:");
  usuariosTeste.forEach((usuario, index) => {
    console.log(`   ${index + 1}. ${usuario.nomeCompleto} - ${usuario.email}`);
  });
  console.log("");
  console.log("🔗 Verifique os dados no Firebase Console:");
  console.log(`   https://console.firebase.google.com/u/0/project/${process.env.FIREBASE_PROJECT_ID}/firestore`);
  console.log("");
  console.log("🧪 Para testar o cadastro:");
  console.log("   Use qualquer um dos emails acima com senha: 123456");
  
  process.exit(0);
}

// Executar
criarUsuarios().catch(error => {
  console.error("❌ Erro na criação de usuários:", error);
  process.exit(1);
});















