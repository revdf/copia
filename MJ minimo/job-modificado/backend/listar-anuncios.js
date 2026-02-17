import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

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
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();

async function listarAnuncios() {
  const snapshot = await db.collection('anuncios').get();
  const anuncios = [];
  
  snapshot.forEach(doc => {
    anuncios.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  anuncios.sort((a, b) => {
    const dateA = a.createdAt?.toDate() || new Date(0);
    const dateB = b.createdAt?.toDate() || new Date(0);
    return dateA - dateB;
  });
  
  console.log('📋 Anúncios N3 (posições 6-8):');
  for (let i = 6; i <= 8 && i < anuncios.length; i++) {
    const ad = anuncios[i];
    console.log(`${i}: ${ad.nome} - ${ad.foto_capa}`);
  }
  
  console.log('\n📋 Anúncios N7 (posições 9-11):');
  for (let i = 9; i <= 11 && i < anuncios.length; i++) {
    const ad = anuncios[i];
    console.log(`${i}: ${ad.nome} - ${ad.foto_capa}`);
  }
}

listarAnuncios().then(() => process.exit(0));
