-- =====================================================
-- FUNÇÕES DE VALIDAÇÃO E HELPERS
-- =====================================================

-- =====================================================
-- FUNÇÃO: Validar se anúncio tem mínimo de fotos obrigatórias
-- =====================================================

CREATE OR REPLACE FUNCTION validar_fotos_obrigatorias(p_anuncio_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_min_fotos INTEGER;
BEGIN
    -- Buscar configuração do sistema
    SELECT CAST(valor AS INTEGER) INTO v_min_fotos
    FROM configuracoes_sistema
    WHERE chave = 'min_fotos_obrigatorias';
    
    -- Se não encontrar, usar padrão
    IF v_min_fotos IS NULL THEN
        v_min_fotos := 4;
    END IF;
    
    -- Contar fotos obrigatórias
    SELECT COUNT(*) INTO v_count
    FROM anuncio_fotos
    WHERE anuncio_id = p_anuncio_id
      AND obrigatoria = true;
    
    RETURN v_count >= v_min_fotos;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Validar se anúncio tem pelo menos uma forma de pagamento
-- =====================================================

CREATE OR REPLACE FUNCTION validar_formas_pagamento(p_anuncio_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM anuncio_formas_pagamento
    WHERE anuncio_id = p_anuncio_id;
    
    RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Contar perfis de um anúncio
-- =====================================================

CREATE OR REPLACE FUNCTION contar_perfis_anuncio(p_anuncio_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM anuncio_perfis
    WHERE anuncio_id = p_anuncio_id;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Contar especialidades de um anúncio
-- =====================================================

CREATE OR REPLACE FUNCTION contar_especialidades_anuncio(p_anuncio_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM anuncio_especialidades
    WHERE anuncio_id = p_anuncio_id;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Contar categorias de um anúncio
-- =====================================================

CREATE OR REPLACE FUNCTION contar_categorias_anuncio(p_anuncio_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM anuncio_categorias
    WHERE anuncio_id = p_anuncio_id;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Verificar se anúncio pode ser ativado
-- =====================================================

CREATE OR REPLACE FUNCTION pode_ativar_anuncio(p_anuncio_id UUID)
RETURNS TABLE (
    pode_ativar BOOLEAN,
    motivo TEXT
) AS $$
DECLARE
    v_anuncio anuncios%ROWTYPE;
    v_fotos_ok BOOLEAN;
    v_pagamento_ok BOOLEAN;
    v_perfis_count INTEGER;
    v_especialidades_count INTEGER;
    v_categorias_count INTEGER;
    v_motivo TEXT := '';
BEGIN
    -- Buscar anúncio
    SELECT * INTO v_anuncio
    FROM anuncios
    WHERE id = p_anuncio_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Anúncio não encontrado'::TEXT;
        RETURN;
    END IF;
    
    -- Validar descrição
    IF LENGTH(TRIM(v_anuncio.descricao)) < 15 THEN
        RETURN QUERY SELECT false, 'Descrição deve ter no mínimo 15 caracteres'::TEXT;
        RETURN;
    END IF;
    
    -- Validar idade
    IF v_anuncio.idade IS NOT NULL AND (v_anuncio.idade < 18 OR v_anuncio.idade > 99) THEN
        RETURN QUERY SELECT false, 'Idade deve estar entre 18 e 99 anos'::TEXT;
        RETURN;
    END IF;
    
    -- Validar fotos obrigatórias
    v_fotos_ok := validar_fotos_obrigatorias(p_anuncio_id);
    IF NOT v_fotos_ok THEN
        RETURN QUERY SELECT false, 'Anúncio deve ter no mínimo 4 fotos obrigatórias'::TEXT;
        RETURN;
    END IF;
    
    -- Validar formas de pagamento
    v_pagamento_ok := validar_formas_pagamento(p_anuncio_id);
    IF NOT v_pagamento_ok THEN
        RETURN QUERY SELECT false, 'Anúncio deve ter pelo menos uma forma de pagamento'::TEXT;
        RETURN;
    END IF;
    
    -- Validar perfis (máximo 2)
    v_perfis_count := contar_perfis_anuncio(p_anuncio_id);
    IF v_perfis_count > 2 THEN
        RETURN QUERY SELECT false, 'Anúncio pode ter no máximo 2 perfis'::TEXT;
        RETURN;
    END IF;
    
    -- Validar especialidades (máximo 3)
    v_especialidades_count := contar_especialidades_anuncio(p_anuncio_id);
    IF v_especialidades_count > 3 THEN
        RETURN QUERY SELECT false, 'Anúncio pode ter no máximo 3 especialidades'::TEXT;
        RETURN;
    END IF;
    
    -- Validar categorias (máximo 3)
    v_categorias_count := contar_categorias_anuncio(p_anuncio_id);
    IF v_categorias_count > 3 THEN
        RETURN QUERY SELECT false, 'Anúncio pode ter no máximo 3 categorias'::TEXT;
        RETURN;
    END IF;
    
    -- Tudo OK
    RETURN QUERY SELECT true, 'Anúncio pode ser ativado'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Atualizar data_fim do anúncio baseado no pagamento
-- =====================================================

CREATE OR REPLACE FUNCTION atualizar_data_fim_anuncio()
RETURNS TRIGGER AS $$
DECLARE
    v_duracao_dias INTEGER;
BEGIN
    -- Se o pagamento foi confirmado, atualizar data_fim do anúncio
    IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.anuncio_id IS NOT NULL THEN
        -- Buscar duração do plano
        SELECT duracao_dias INTO v_duracao_dias
        FROM planos
        WHERE id = NEW.plano_id;
        
        -- Atualizar anúncio
        UPDATE anuncios
        SET data_inicio = COALESCE(data_inicio, NOW()),
            data_fim = NOW() + (v_duracao_dias || ' days')::INTERVAL,
            status = 'pending_approval'
        WHERE id = NEW.anuncio_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar data_fim quando pagamento é confirmado
CREATE TRIGGER trigger_atualizar_data_fim_anuncio
    AFTER UPDATE OF status ON pagamentos
    FOR EACH ROW
    WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
    EXECUTE FUNCTION atualizar_data_fim_anuncio();

-- =====================================================
-- FUNÇÃO: Verificar anúncios expirados
-- =====================================================

CREATE OR REPLACE FUNCTION verificar_anuncios_expirados()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE anuncios
    SET status = 'expired'
    WHERE status = 'active'
      AND data_fim IS NOT NULL
      AND data_fim < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================



