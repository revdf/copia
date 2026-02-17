import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
  credentials: true
}));

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = getFirestore();
const bucket = getStorage().bucket();

// Endpoint principal
app.get("/api/anuncios", async (req, res) => {
  try {
    const snapshot = await db.collection("anuncios").get();
    const anuncios = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      data.id = doc.id; // Adicionar ID do documento
      if (data.foto_capa) {
        try {
          const [url] = await bucket.file(data.foto_capa).getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24,
          });
          data.foto_capa_url = url;
        } catch (e) {
          data.foto_capa_url = null;
        }
      }
      anuncios.push(data);
    }
    res.json(anuncios);
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Endpoint para atualizar anúncios
app.put("/api/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`Atualizando anúncio ${id} com:`, updates);
    
    // Atualizar no Firebase
    await db.collection("anuncios").doc(id).update(updates);
    
    res.json({ success: true, message: "Anúncio atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar anúncio:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para atualizar múltiplos anúncios
app.put("/api/anuncios/bulk", async (req, res) => {
  try {
    const { updates } = req.body;
    
    console.log(`Recebido ${updates.length} atualizações em lote`);
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: "Updates deve ser um array" });
    }
    
    const batch = db.batch();
    let successCount = 0;
    
    for (const update of updates) {
      if (update.id) {
        const docRef = db.collection("anuncios").doc(update.id);
        const { id, ...updateData } = update;
        batch.update(docRef, updateData);
        successCount++;
      }
    }
    
    await batch.commit();
    
    res.json({ 
      success: true, 
      message: `${successCount} anúncios atualizados com sucesso`,
      updated: successCount
    });
  } catch (error) {
    console.error("Erro ao atualizar anúncios em lote:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
