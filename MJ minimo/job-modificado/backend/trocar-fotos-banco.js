import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

// Inicializar Firebase Admin
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

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  console.log("✅ Firebase Admin SDK inicializado com sucesso");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

const db = admin.firestore();

async function trocarFotosNoBanco() {
  try {
    console.log("🔄 Iniciando troca de fotos no banco de dados...");
    
    // Buscar todos os anúncios
    const snapshot = await db.collection('anuncios').get();
    const anuncios = [];
    
    snapshot.forEach(doc => {
      anuncios.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Encontrados ${anuncios.length} anúncios no banco`);
    
    // Ordenar por data de criação para manter consistência
    anuncios.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateA - dateB;
    });
    
    // Identificar anúncios por posição (baseado na lógica da página premium)
    // N1: índices 0-5 (6 anúncios)
    // N3: índices 6-8 (3 anúncios) 
    // N7: índices 9+ (resto)
    
    if (anuncios.length < 10) {
      console.log("⚠️ Não há anúncios suficientes para fazer a troca");
      return;
    }
    
    // Anúncio N3 (índice 6) - Eloa
    const anuncioN3 = anuncios[6];
    // Anúncio N7 (índice 9) - Alice  
    const anuncioN7 = anuncios[9];
    
    if (!anuncioN3 || !anuncioN7) {
      console.log("⚠️ Anúncios não encontrados nas posições esperadas");
      return;
    }
    
    console.log(`📸 Anúncio N3 (posição 6): ${anuncioN3.nome} - Foto atual: ${anuncioN3.foto_capa}`);
    console.log(`📸 Anúncio N7 (posição 9): ${anuncioN7.nome} - Foto atual: ${anuncioN7.foto_capa}`);
    
    // Trocar as fotos
    const fotoN3Original = anuncioN3.foto_capa;
    const fotoN7Original = anuncioN7.foto_capa;
    
    // Atualizar no banco
    await db.collection('anuncios').doc(anuncioN3.id).update({
      foto_capa: fotoN7Original,
      coverImage: fotoN7Original,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('anuncios').doc(anuncioN7.id).update({
      foto_capa: fotoN3Original,
      coverImage: fotoN3Original,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("✅ Troca de fotos realizada com sucesso!");
    console.log(`🔄 ${anuncioN3.nome} (N3) agora tem a foto: ${fotoN7Original}`);
    console.log(`🔄 ${anuncioN7.nome} (N7) agora tem a foto: ${fotoN3Original}`);
    
  } catch (error) {
    console.error("❌ Erro ao trocar fotos:", error);
  }
}

// Executar a troca
trocarFotosNoBanco()
  .then(() => {
    console.log("🎉 Processo concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
