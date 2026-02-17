-- =====================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - MANSÃO DO JOB
-- Baseado no Modelo DBML
-- =====================================================

-- Criar banco de dados (ajustar conforme necessário)
-- CREATE DATABASE mansao_do_job;
-- \c mansao_do_job;

-- =====================================================
-- ENUMS
-- =====================================================

-- User Role
CREATE TYPE user_role AS ENUM ('advertiser', 'cliente', 'admin');

-- User Status
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- Anúncio Categoria Tipo
CREATE TYPE anuncio_categoria_tipo AS ENUM ('mulher', 'trans', 'homem', 'mulher-luxo');

-- Anúncio Categoria Serviço
CREATE TYPE anuncio_categoria_servico AS ENUM ('acompanhantes', 'massagistas', 'sexo-virtual');

-- Anúncio Status
CREATE TYPE anuncio_status AS ENUM ('draft', 'pending_approval', 'active', 'inactive', 'rejected', 'expired');

-- Media Tipo Foto
CREATE TYPE media_tipo_foto AS ENUM ('avatar', 'banner', 'galeria', 'perfil_preview');

-- Media Tipo Video
CREATE TYPE media_tipo_video AS ENUM ('capa', 'galeria');

-- Media Tipo Audio
CREATE TYPE media_tipo_audio AS ENUM ('galeria');

-- Pagamento Status
CREATE TYPE pagamento_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');

-- Anúncio Curtida Tipo
CREATE TYPE anuncio_curtida_tipo AS ENUM ('like', 'favorite');

-- Anúncio Contato Tipo
CREATE TYPE anuncio_contato_tipo AS ENUM ('whatsapp', 'telefone', 'ligacao', 'email');

-- Mensagem Status
CREATE TYPE mensagem_status AS ENUM ('unread', 'read', 'replied', 'archived');

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABELA: USUÁRIOS (users)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'cliente',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Campos específicos para anunciantes
    nome_completo VARCHAR(255),
    cpf VARCHAR(11) UNIQUE,
    whatsapp VARCHAR(50),
    country_code VARCHAR(5) DEFAULT '55',
    provider VARCHAR(50),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    display_name VARCHAR(255),
    photo_url VARCHAR(500),
    telefone_fixo VARCHAR(50),
    
    -- Campos específicos para clientes
    nickname VARCHAR(15) UNIQUE,
    aceita_termos BOOLEAN NOT NULL DEFAULT true,
    recebe_emails BOOLEAN NOT NULL DEFAULT false
);

-- Índices para users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_cpf ON users(cpf) WHERE cpf IS NOT NULL;
CREATE UNIQUE INDEX idx_users_nickname ON users(nickname) WHERE nickname IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Trigger para updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIOS (anuncios)
-- =====================================================

CREATE TABLE anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    categoria_tipo anuncio_categoria_tipo NOT NULL,
    categoria_servico anuncio_categoria_servico NOT NULL,
    nome_anuncio VARCHAR(20) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    bairro VARCHAR(255),
    whatsapp_anuncio VARCHAR(50) NOT NULL,
    status anuncio_status NOT NULL DEFAULT 'draft',
    plano_selecionado VARCHAR(50),
    data_inicio TIMESTAMP,
    data_fim TIMESTAMP,
    
    -- Informações físicas e pessoais
    idade INTEGER,
    tipo_fisico VARCHAR(50),
    biotipo VARCHAR(50),
    altura VARCHAR(20),
    peso VARCHAR(20),
    manequim VARCHAR(10),
    pes VARCHAR(10),
    cabelos VARCHAR(100),
    olhos VARCHAR(50),
    
    -- Informações de atendimento
    horario_24h BOOLEAN NOT NULL DEFAULT false,
    horario_inicio TIME,
    horario_fim TIME,
    cache DECIMAL(10,2),
    cache_combinar BOOLEAN NOT NULL DEFAULT false,
    descricao TEXT NOT NULL,
    frase_efeito VARCHAR(255),
    permite_fumar VARCHAR(20),
    drinks VARCHAR(20),
    viaja BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para anuncios
CREATE INDEX idx_anuncios_user_id ON anuncios(user_id);
CREATE INDEX idx_anuncios_status ON anuncios(status);
CREATE INDEX idx_anuncios_categoria_tipo ON anuncios(categoria_tipo);
CREATE INDEX idx_anuncios_categoria_servico ON anuncios(categoria_servico);
CREATE INDEX idx_anuncios_estado ON anuncios(estado);
CREATE INDEX idx_anuncios_cidade ON anuncios(cidade);
CREATE INDEX idx_anuncios_data_fim ON anuncios(data_fim);
CREATE INDEX idx_anuncios_ativo ON anuncios(status, data_fim) WHERE status = 'active';

-- Trigger para updated_at
CREATE TRIGGER update_anuncios_updated_at
    BEFORE UPDATE ON anuncios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO MASSAGISTA (anuncio_massagista)
-- =====================================================

CREATE TABLE anuncio_massagista (
    anuncio_id UUID PRIMARY KEY REFERENCES anuncios(id) ON DELETE CASCADE,
    tipos_massagem JSONB,
    finalizacao JSONB,
    servicos_extras JSONB,
    atendimento_para JSONB,
    instalacoes JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_anuncio_massagista_updated_at
    BEFORE UPDATE ON anuncio_massagista
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO ACOMPANHANTE (anuncio_acompanhante)
-- =====================================================

CREATE TABLE anuncio_acompanhante (
    anuncio_id UUID PRIMARY KEY REFERENCES anuncios(id) ON DELETE CASCADE,
    oral_sem BOOLEAN,
    beija BOOLEAN,
    anal BOOLEAN,
    mora_so BOOLEAN,
    atende JSONB,
    eu_faco JSONB,
    pubis JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER update_anuncio_acompanhante_updated_at
    BEFORE UPDATE ON anuncio_acompanhante
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO FOTOS (anuncio_fotos)
-- =====================================================

CREATE TABLE anuncio_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    tipo media_tipo_foto NOT NULL DEFAULT 'galeria',
    ordem INTEGER,
    obrigatoria BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para anuncio_fotos
CREATE INDEX idx_anuncio_fotos_anuncio_id ON anuncio_fotos(anuncio_id);
CREATE INDEX idx_anuncio_fotos_tipo ON anuncio_fotos(tipo);
CREATE INDEX idx_anuncio_fotos_ordem ON anuncio_fotos(anuncio_id, ordem);

-- Trigger para updated_at
CREATE TRIGGER update_anuncio_fotos_updated_at
    BEFORE UPDATE ON anuncio_fotos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO VÍDEOS (anuncio_videos)
-- =====================================================

CREATE TABLE anuncio_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    tipo media_tipo_video NOT NULL DEFAULT 'galeria',
    ordem INTEGER,
    duracao INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para anuncio_videos
CREATE INDEX idx_anuncio_videos_anuncio_id ON anuncio_videos(anuncio_id);
CREATE INDEX idx_anuncio_videos_ordem ON anuncio_videos(anuncio_id, ordem);

-- Trigger para updated_at
CREATE TRIGGER update_anuncio_videos_updated_at
    BEFORE UPDATE ON anuncio_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO ÁUDIOS (anuncio_audios)
-- =====================================================

CREATE TABLE anuncio_audios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    titulo VARCHAR(255),
    duracao INTEGER,
    ordem INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para anuncio_audios
CREATE INDEX idx_anuncio_audios_anuncio_id ON anuncio_audios(anuncio_id);
CREATE INDEX idx_anuncio_audios_ordem ON anuncio_audios(anuncio_id, ordem);

-- Trigger para updated_at
CREATE TRIGGER update_anuncio_audios_updated_at
    BEFORE UPDATE ON anuncio_audios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: PLANOS (planos)
-- =====================================================

CREATE TABLE planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    duracao_dias INTEGER NOT NULL DEFAULT 30,
    max_fotos INTEGER,
    max_videos INTEGER,
    max_audios INTEGER,
    permite_stories BOOLEAN NOT NULL DEFAULT false,
    destaque BOOLEAN NOT NULL DEFAULT false,
    suporte_prioritario BOOLEAN NOT NULL DEFAULT false,
    estatisticas BOOLEAN NOT NULL DEFAULT false,
    badge_exclusivo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para planos
CREATE INDEX idx_planos_nome ON planos(nome);

-- Trigger para updated_at
CREATE TRIGGER update_planos_updated_at
    BEFORE UPDATE ON planos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: PAGAMENTOS (pagamentos)
-- =====================================================

CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anuncio_id UUID REFERENCES anuncios(id) ON DELETE SET NULL,
    plano_id UUID NOT NULL REFERENCES planos(id),
    valor DECIMAL(10,2) NOT NULL,
    status pagamento_status NOT NULL DEFAULT 'pending',
    metodo_pagamento VARCHAR(50),
    transaction_id VARCHAR(255),
    data_pagamento TIMESTAMP,
    data_vencimento TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para pagamentos
CREATE INDEX idx_pagamentos_user_id ON pagamentos(user_id);
CREATE INDEX idx_pagamentos_anuncio_id ON pagamentos(anuncio_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_data_vencimento ON pagamentos(data_vencimento);

-- Trigger para updated_at
CREATE TRIGGER update_pagamentos_updated_at
    BEFORE UPDATE ON pagamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: PAGAMENTO HISTÓRICO (pagamento_historico)
-- =====================================================

CREATE TABLE pagamento_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pagamento_id UUID NOT NULL REFERENCES pagamentos(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    observacao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para pagamento_historico
CREATE INDEX idx_pagamento_historico_pagamento_id ON pagamento_historico(pagamento_id);

-- Trigger para updated_at
CREATE TRIGGER update_pagamento_historico_updated_at
    BEFORE UPDATE ON pagamento_historico
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO VISUALIZAÇÕES (anuncio_visualizacoes)
-- =====================================================

CREATE TABLE anuncio_visualizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para anuncio_visualizacoes
CREATE INDEX idx_anuncio_visualizacoes_anuncio_id ON anuncio_visualizacoes(anuncio_id);
CREATE INDEX idx_anuncio_visualizacoes_user_id ON anuncio_visualizacoes(user_id);
CREATE INDEX idx_anuncio_visualizacoes_created_at ON anuncio_visualizacoes(created_at);

-- Trigger para updated_at (opcional para logs)
CREATE TRIGGER update_anuncio_visualizacoes_updated_at
    BEFORE UPDATE ON anuncio_visualizacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO CURTIDAS (anuncio_curtidas)
-- =====================================================

CREATE TABLE anuncio_curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo anuncio_curtida_tipo NOT NULL DEFAULT 'like',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraint: um usuário só pode curtir/favoritar um anúncio uma vez por tipo
    UNIQUE(anuncio_id, user_id, tipo)
);

-- Índices para anuncio_curtidas
CREATE INDEX idx_anuncio_curtidas_anuncio_id ON anuncio_curtidas(anuncio_id);
CREATE INDEX idx_anuncio_curtidas_user_id ON anuncio_curtidas(user_id);
CREATE INDEX idx_anuncio_curtidas_tipo ON anuncio_curtidas(tipo);

-- Trigger para updated_at (opcional para logs)
CREATE TRIGGER update_anuncio_curtidas_updated_at
    BEFORE UPDATE ON anuncio_curtidas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: ANÚNCIO CONTATOS (anuncio_contatos)
-- =====================================================

CREATE TABLE anuncio_contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tipo_contato anuncio_contato_tipo NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para anuncio_contatos
CREATE INDEX idx_anuncio_contatos_anuncio_id ON anuncio_contatos(anuncio_id);
CREATE INDEX idx_anuncio_contatos_user_id ON anuncio_contatos(user_id);
CREATE INDEX idx_anuncio_contatos_tipo ON anuncio_contatos(tipo_contato);

-- Trigger para updated_at (opcional para logs)
CREATE TRIGGER update_anuncio_contatos_updated_at
    BEFORE UPDATE ON anuncio_contatos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: MENSAGENS CONTATO (mensagens_contato)
-- =====================================================

CREATE TABLE mensagens_contato (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    mensagem TEXT NOT NULL,
    status mensagem_status NOT NULL DEFAULT 'unread',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para mensagens_contato
CREATE INDEX idx_mensagens_contato_anuncio_id ON mensagens_contato(anuncio_id);
CREATE INDEX idx_mensagens_contato_status ON mensagens_contato(status);
CREATE INDEX idx_mensagens_contato_created_at ON mensagens_contato(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_mensagens_contato_updated_at
    BEFORE UPDATE ON mensagens_contato
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: CONFIGURAÇÕES SISTEMA (configuracoes_sistema)
-- =====================================================

CREATE TABLE configuracoes_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave VARCHAR(255) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50),
    descricao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para configuracoes_sistema
CREATE UNIQUE INDEX idx_configuracoes_sistema_chave ON configuracoes_sistema(chave);

-- Trigger para updated_at
CREATE TRIGGER update_configuracoes_sistema_updated_at
    BEFORE UPDATE ON configuracoes_sistema
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA: USER PREFERÊNCIAS (user_preferencias)
-- =====================================================

CREATE TABLE user_preferencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recebe_emails_marketing BOOLEAN NOT NULL DEFAULT false,
    recebe_notificacoes BOOLEAN NOT NULL DEFAULT true,
    idioma VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para user_preferencias
CREATE UNIQUE INDEX idx_user_preferencias_user_id ON user_preferencias(user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_preferencias_updated_at
    BEFORE UPDATE ON user_preferencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELAS DE JUNÇÃO (Many-to-Many)
-- =====================================================

-- Anúncio Perfis
CREATE TABLE anuncio_perfis (
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    perfil VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (anuncio_id, perfil)
);

-- Anúncio Atende Em
CREATE TABLE anuncio_atende_em (
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    local VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (anuncio_id, local)
);

-- Anúncio Períodos
CREATE TABLE anuncio_periodos (
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    periodo VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (anuncio_id, periodo)
);

-- Anúncio Formas Pagamento
CREATE TABLE anuncio_formas_pagamento (
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    forma_pagamento VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (anuncio_id, forma_pagamento)
);

-- Anúncio Especialidades
CREATE TABLE anuncio_especialidades (
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    especialidade VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (anuncio_id, especialidade)
);

-- Anúncio Categorias
CREATE TABLE anuncio_categorias (
    anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (anuncio_id, categoria)
);

-- Índices para tabelas de junção
CREATE INDEX idx_anuncio_perfis_anuncio_id ON anuncio_perfis(anuncio_id);
CREATE INDEX idx_anuncio_atende_em_anuncio_id ON anuncio_atende_em(anuncio_id);
CREATE INDEX idx_anuncio_periodos_anuncio_id ON anuncio_periodos(anuncio_id);
CREATE INDEX idx_anuncio_formas_pagamento_anuncio_id ON anuncio_formas_pagamento(anuncio_id);
CREATE INDEX idx_anuncio_especialidades_anuncio_id ON anuncio_especialidades(anuncio_id);
CREATE INDEX idx_anuncio_categorias_anuncio_id ON anuncio_categorias(anuncio_id);

-- Triggers para updated_at nas tabelas de junção
CREATE TRIGGER update_anuncio_perfis_updated_at
    BEFORE UPDATE ON anuncio_perfis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anuncio_atende_em_updated_at
    BEFORE UPDATE ON anuncio_atende_em
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anuncio_periodos_updated_at
    BEFORE UPDATE ON anuncio_periodos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anuncio_formas_pagamento_updated_at
    BEFORE UPDATE ON anuncio_formas_pagamento
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anuncio_especialidades_updated_at
    BEFORE UPDATE ON anuncio_especialidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anuncio_categorias_updated_at
    BEFORE UPDATE ON anuncio_categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================



