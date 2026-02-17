-- =====================================================
-- DADOS INICIAIS - MANSÃO DO JOB
-- =====================================================

-- =====================================================
-- INSERIR PLANOS PADRÃO
-- =====================================================

INSERT INTO planos (nome, preco, duracao_dias, max_fotos, max_videos, max_audios, permite_stories, destaque, suporte_prioritario, estatisticas, badge_exclusivo) VALUES
('Básico', 39.90, 30, 8, 0, 0, false, false, false, false, false),
('Plus', 69.90, 30, 8, 1, 1, false, true, true, true, false),
('Especial', 99.90, 30, 25, 3, 1, true, true, true, true, true);

-- =====================================================
-- CONFIGURAÇÕES DO SISTEMA
-- =====================================================

INSERT INTO configuracoes_sistema (chave, valor, tipo, descricao) VALUES
('max_fotos_galeria', '20', 'number', 'Número máximo de fotos na galeria'),
('min_fotos_obrigatorias', '4', 'number', 'Número mínimo de fotos obrigatórias na galeria'),
('max_videos', '3', 'number', 'Número máximo de vídeos permitidos'),
('max_audios', '3', 'number', 'Número máximo de áudios permitidos'),
('max_perfis', '2', 'number', 'Número máximo de perfis que um anúncio pode ter'),
('max_especialidades', '3', 'number', 'Número máximo de especialidades por anúncio'),
('max_categorias', '3', 'number', 'Número máximo de categorias especiais por anúncio'),
('min_descricao_length', '15', 'number', 'Tamanho mínimo da descrição do anúncio'),
('min_idade', '18', 'number', 'Idade mínima permitida'),
('max_idade', '99', 'number', 'Idade máxima permitida'),
('max_foto_size_mb', '20', 'number', 'Tamanho máximo de foto em MB'),
('max_video_size_mb', '100', 'number', 'Tamanho máximo de vídeo em MB'),
('min_audio_duration', '10', 'number', 'Duração mínima de áudio em segundos'),
('max_audio_duration', '30', 'number', 'Duração máxima de áudio em segundos'),
('anuncio_expiration_days', '30', 'number', 'Dias de validade do anúncio após pagamento'),
('storage_provider', 's3', 'string', 'Provedor de storage para mídias (s3, gcs, local)'),
('cdn_enabled', 'true', 'boolean', 'Habilitar CDN para servir mídias'),
('email_verification_required', 'true', 'boolean', 'Requerer verificação de email para anunciantes'),
('cpf_verification_required', 'true', 'boolean', 'Requerer verificação de CPF para anunciantes');

-- =====================================================
-- CRIAR USUÁRIO ADMIN INICIAL (OPCIONAL)
-- =====================================================

-- IMPORTANTE: Altere a senha antes de usar em produção!
-- A senha deve ser hasheada usando bcrypt ou similar
-- Exemplo de hash para senha "admin123": $2b$10$...

-- INSERT INTO users (email, password_hash, role, status, nome_completo, email_verified) 
-- VALUES ('admin@mansaodojob.com', '$2b$10$...', 'admin', 'active', 'Administrador', true);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================



