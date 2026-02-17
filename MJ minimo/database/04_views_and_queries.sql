-- =====================================================
-- VIEWS E QUERIES ÚTEIS
-- =====================================================

-- =====================================================
-- VIEW: Anúncios Ativos com Informações Completas
-- =====================================================

CREATE OR REPLACE VIEW vw_anuncios_ativos AS
SELECT 
    a.id,
    a.nome_anuncio,
    a.categoria_tipo,
    a.categoria_servico,
    a.estado,
    a.cidade,
    a.bairro,
    a.status,
    a.data_inicio,
    a.data_fim,
    u.email as user_email,
    u.display_name as user_name,
    p.nome as plano_nome,
    p.preco as plano_preco,
    (SELECT COUNT(*) FROM anuncio_fotos WHERE anuncio_id = a.id) as total_fotos,
    (SELECT COUNT(*) FROM anuncio_videos WHERE anuncio_id = a.id) as total_videos,
    (SELECT COUNT(*) FROM anuncio_audios WHERE anuncio_id = a.id) as total_audios,
    (SELECT COUNT(*) FROM anuncio_visualizacoes WHERE anuncio_id = a.id) as total_visualizacoes,
    (SELECT COUNT(*) FROM anuncio_curtidas WHERE anuncio_id = a.id AND tipo = 'like') as total_curtidas,
    (SELECT COUNT(*) FROM anuncio_curtidas WHERE anuncio_id = a.id AND tipo = 'favorite') as total_favoritos
FROM anuncios a
JOIN users u ON a.user_id = u.id
LEFT JOIN pagamentos pg ON a.id = pg.anuncio_id AND pg.status = 'paid'
LEFT JOIN planos p ON pg.plano_id = p.id
WHERE a.status = 'active'
  AND (a.data_fim IS NULL OR a.data_fim > NOW());

-- =====================================================
-- VIEW: Estatísticas de Anúncios por Categoria
-- =====================================================

CREATE OR REPLACE VIEW vw_estatisticas_categorias AS
SELECT 
    categoria_tipo,
    categoria_servico,
    COUNT(*) as total_anuncios,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as anuncios_ativos,
    COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as aguardando_aprovacao,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expirados,
    AVG((SELECT COUNT(*) FROM anuncio_visualizacoes WHERE anuncio_id = anuncios.id)) as media_visualizacoes
FROM anuncios
GROUP BY categoria_tipo, categoria_servico;

-- =====================================================
-- VIEW: Anúncios Próximos ao Vencimento
-- =====================================================

CREATE OR REPLACE VIEW vw_anuncios_vencendo AS
SELECT 
    a.id,
    a.nome_anuncio,
    a.categoria_tipo,
    a.categoria_servico,
    a.estado,
    a.cidade,
    a.data_fim,
    u.email as user_email,
    u.display_name as user_name,
    p.valor as ultimo_pagamento,
    (a.data_fim - NOW())::INTEGER as dias_restantes
FROM anuncios a
JOIN users u ON a.user_id = u.id
LEFT JOIN pagamentos p ON a.id = p.anuncio_id AND p.status = 'paid'
WHERE a.status = 'active'
  AND a.data_fim IS NOT NULL
  AND a.data_fim BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY a.data_fim ASC;

-- =====================================================
-- VIEW: Relatório de Pagamentos
-- =====================================================

CREATE OR REPLACE VIEW vw_relatorio_pagamentos AS
SELECT 
    DATE_TRUNC('month', created_at) as mes,
    status,
    COUNT(*) as total_pagamentos,
    SUM(valor) as valor_total,
    AVG(valor) as valor_medio,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as pagamentos_confirmados,
    SUM(CASE WHEN status = 'paid' THEN valor ELSE 0 END) as receita_confirmada
FROM pagamentos
GROUP BY DATE_TRUNC('month', created_at), status
ORDER BY mes DESC, status;

-- =====================================================
-- VIEW: Top Anúncios Mais Visualizados
-- =====================================================

CREATE OR REPLACE VIEW vw_top_anuncios_visualizados AS
SELECT 
    a.id,
    a.nome_anuncio,
    a.categoria_tipo,
    a.categoria_servico,
    a.estado,
    a.cidade,
    COUNT(v.id) as total_visualizacoes,
    COUNT(DISTINCT v.user_id) as visualizacoes_unicas,
    COUNT(DISTINCT v.ip_address) as ips_unicos,
    COUNT(c.id) as total_curtidas,
    COUNT(f.id) as total_favoritos
FROM anuncios a
LEFT JOIN anuncio_visualizacoes v ON a.id = v.anuncio_id
LEFT JOIN anuncio_curtidas c ON a.id = c.anuncio_id AND c.tipo = 'like'
LEFT JOIN anuncio_curtidas f ON a.id = f.anuncio_id AND f.tipo = 'favorite'
WHERE a.status = 'active'
GROUP BY a.id, a.nome_anuncio, a.categoria_tipo, a.categoria_servico, a.estado, a.cidade
ORDER BY total_visualizacoes DESC
LIMIT 100;

-- =====================================================
-- QUERY: Buscar Anúncios por Filtros
-- =====================================================

-- Exemplo de função para buscar anúncios com filtros
CREATE OR REPLACE FUNCTION buscar_anuncios(
    p_categoria_tipo anuncio_categoria_tipo DEFAULT NULL,
    p_categoria_servico anuncio_categoria_servico DEFAULT NULL,
    p_estado VARCHAR DEFAULT NULL,
    p_cidade VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    nome_anuncio VARCHAR,
    categoria_tipo anuncio_categoria_tipo,
    categoria_servico anuncio_categoria_servico,
    estado VARCHAR,
    cidade VARCHAR,
    bairro VARCHAR,
    idade INTEGER,
    foto_perfil VARCHAR,
    total_fotos INTEGER,
    total_visualizacoes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.nome_anuncio,
        a.categoria_tipo,
        a.categoria_servico,
        a.estado,
        a.cidade,
        a.bairro,
        a.idade,
        (SELECT url FROM anuncio_fotos WHERE anuncio_id = a.id AND tipo = 'avatar' LIMIT 1) as foto_perfil,
        (SELECT COUNT(*) FROM anuncio_fotos WHERE anuncio_id = a.id) as total_fotos,
        (SELECT COUNT(*) FROM anuncio_visualizacoes WHERE anuncio_id = a.id) as total_visualizacoes
    FROM anuncios a
    WHERE a.status = 'active'
      AND (a.data_fim IS NULL OR a.data_fim > NOW())
      AND (p_categoria_tipo IS NULL OR a.categoria_tipo = p_categoria_tipo)
      AND (p_categoria_servico IS NULL OR a.categoria_servico = p_categoria_servico)
      AND (p_estado IS NULL OR a.estado = p_estado)
      AND (p_cidade IS NULL OR a.cidade = p_cidade)
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================



