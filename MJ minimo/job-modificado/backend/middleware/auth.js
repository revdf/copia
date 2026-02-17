/**
 * Middleware de Autenticação
 * Suporta Bearer token (API) e sessão/cookie (compatibilidade)
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mudar_em_producao';

/**
 * Middleware de autenticação
 * Tenta primeiro Bearer token, depois sessão/cookie
 */
export const authMiddleware = (req, res, next) => {
  // 1) Tentar token em header Authorization: Bearer <token>
  const authHeader = req.headers.authorization || '';
  let token = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // 2) Se ainda não tiver token, tentar cookie/session (compatibilidade)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token && req.session && req.session.token) {
    token = req.session.token;
  }

  if (!token) {
    // Se for requisição JSON (API), retornar JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token não fornecido' 
      });
    }
    // Caso contrário, redirecionar (compatibilidade com rotas HTML)
    return res.redirect('/login.html');
  }

  try {
    // Verificar token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    
    // Se for requisição JSON (API), retornar JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido ou expirado' 
      });
    }
    // Caso contrário, redirecionar (compatibilidade)
    return res.redirect('/login.html');
  }
};

export default authMiddleware;









