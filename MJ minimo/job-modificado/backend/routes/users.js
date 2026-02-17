/**
 * Rotas de Usuários - API JSON
 * Rotas protegidas que requerem autenticação
 */

import express from 'express';
import admin from 'firebase-admin';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const db = admin.firestore();

/**
 * GET /api/users/me
 * Rota protegida - retorna dados do usuário autenticado
 * Retorna JSON: { user }
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      });
    }

    const userData = userDoc.data();
    
    // Remover senha dos dados retornados
    const { password: _, ...userWithoutPassword } = userData;

    return res.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;









