/**
 * Rotas de Autenticação - API JSON
 * Suporta tanto JSON (API) quanto formulários tradicionais (compatibilidade)
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

const router = express.Router();
const db = admin.firestore();

// JWT Secret (deve estar no .env)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mudar_em_producao';

/**
 * POST /api/auth/login
 * Retorna JSON: { success, user, token }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário no Firestore
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Verificar senha (assumindo que está hasheada com bcrypt)
    const isPasswordValid = await bcrypt.compare(password, userData.password || '');
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: userDoc.id, 
        email: userData.email,
        role: userData.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = userData;

    return res.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userWithoutPassword
      },
      token
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

/**
 * POST /api/auth/register
 * Retorna JSON: { success, user }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, ...otherData } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, senha e nome são obrigatórios' 
      });
    }

    // Verificar se usuário já existe
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (!snapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email já cadastrado' 
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const userData = {
      email,
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...otherData
    };

    const docRef = await usersRef.add(userData);

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = userData;

    return res.status(201).json({
      success: true,
      user: {
        id: docRef.id,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;









