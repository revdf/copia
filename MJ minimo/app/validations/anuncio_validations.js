// =====================================================
// VALIDAÇÕES DE ANÚNCIO - CAMADA DE APLICAÇÃO
// =====================================================

/**
 * Validações que devem ser implementadas na aplicação
 * (não no banco de dados)
 */

// =====================================================
// CONSTANTES DE VALIDAÇÃO
// =====================================================

const VALIDATION_RULES = {
    MIN_DESCRICAO_LENGTH: 15,
    MIN_IDADE: 18,
    MAX_IDADE: 99,
    MIN_FOTOS_OBRIGATORIAS: 4,
    MAX_FOTOS_TOTAL: 20,
    MAX_VIDEOS: 3,
    MAX_AUDIOS: 3,
    MAX_PERFIS: 2,
    MAX_ESpecialidades: 3,
    MAX_CATEGORIAS: 3,
    MAX_FOTO_SIZE_MB: 20,
    MAX_VIDEO_SIZE_MB: 100,
    MIN_AUDIO_DURATION_SEC: 10,
    MAX_AUDIO_DURATION_SEC: 30,
    MAX_NOME_ANUNCIO_LENGTH: 20
};

// =====================================================
// VALIDAÇÕES DE ANÚNCIO
// =====================================================

class AnuncioValidator {
    /**
     * Valida descrição do anúncio
     */
    static validateDescricao(descricao) {
        if (!descricao || typeof descricao !== 'string') {
            return { valid: false, error: 'Descrição é obrigatória' };
        }
        
        const trimmed = descricao.trim();
        if (trimmed.length < VALIDATION_RULES.MIN_DESCRICAO_LENGTH) {
            return { 
                valid: false, 
                error: `Descrição deve ter no mínimo ${VALIDATION_RULES.MIN_DESCRICAO_LENGTH} caracteres` 
            };
        }
        
        return { valid: true };
    }

    /**
     * Valida idade
     */
    static validateIdade(idade) {
        if (idade === null || idade === undefined) {
            return { valid: true }; // Idade é opcional
        }
        
        const idadeNum = parseInt(idade);
        if (isNaN(idadeNum)) {
            return { valid: false, error: 'Idade deve ser um número' };
        }
        
        if (idadeNum < VALIDATION_RULES.MIN_IDADE || idadeNum > VALIDATION_RULES.MAX_IDADE) {
            return { 
                valid: false, 
                error: `Idade deve estar entre ${VALIDATION_RULES.MIN_IDADE} e ${VALIDATION_RULES.MAX_IDADE} anos` 
            };
        }
        
        return { valid: true };
    }

    /**
     * Valida nome do anúncio
     */
    static validateNomeAnuncio(nome) {
        if (!nome || typeof nome !== 'string') {
            return { valid: false, error: 'Nome do anúncio é obrigatório' };
        }
        
        const trimmed = nome.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: 'Nome do anúncio não pode estar vazio' };
        }
        
        if (trimmed.length > VALIDATION_RULES.MAX_NOME_ANUNCIO_LENGTH) {
            return { 
                valid: false, 
                error: `Nome do anúncio deve ter no máximo ${VALIDATION_RULES.MAX_NOME_ANUNCIO_LENGTH} caracteres` 
            };
        }
        
        return { valid: true };
    }

    /**
     * Valida fotos obrigatórias
     */
    static validateFotos(fotos) {
        if (!Array.isArray(fotos)) {
            return { valid: false, error: 'Fotos deve ser um array' };
        }
        
        const fotosObrigatorias = fotos.filter(f => f.obrigatoria === true);
        
        if (fotosObrigatorias.length < VALIDATION_RULES.MIN_FOTOS_OBRIGATORIAS) {
            return { 
                valid: false, 
                error: `Anúncio deve ter no mínimo ${VALIDATION_RULES.MIN_FOTOS_OBRIGATORIAS} fotos obrigatórias` 
            };
        }
        
        if (fotos.length > VALIDATION_RULES.MAX_FOTOS_TOTAL) {
            return { 
                valid: false, 
                error: `Anúncio pode ter no máximo ${VALIDATION_RULES.MAX_FOTOS_TOTAL} fotos` 
            };
        }
        
        // Validar foto de perfil obrigatória
        const temFotoPerfil = fotos.some(f => f.tipo === 'avatar' || f.tipo === 'perfil_preview');
        if (!temFotoPerfil) {
            return { valid: false, error: 'Anúncio deve ter uma foto de perfil' };
        }
        
        return { valid: true };
    }

    /**
     * Valida vídeos
     */
    static validateVideos(videos) {
        if (!Array.isArray(videos)) {
            return { valid: false, error: 'Vídeos deve ser um array' };
        }
        
        if (videos.length > VALIDATION_RULES.MAX_VIDEOS) {
            return { 
                valid: false, 
                error: `Anúncio pode ter no máximo ${VALIDATION_RULES.MAX_VIDEOS} vídeos` 
            };
        }
        
        // Validar tamanho de cada vídeo
        for (const video of videos) {
            if (video.size && video.size > VALIDATION_RULES.MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                return { 
                    valid: false, 
                    error: `Vídeo excede o tamanho máximo de ${VALIDATION_RULES.MAX_VIDEO_SIZE_MB}MB` 
                };
            }
        }
        
        return { valid: true };
    }

    /**
     * Valida áudios
     */
    static validateAudios(audios) {
        if (!Array.isArray(audios)) {
            return { valid: false, error: 'Áudios deve ser um array' };
        }
        
        if (audios.length > VALIDATION_RULES.MAX_AUDIOS) {
            return { 
                valid: false, 
                error: `Anúncio pode ter no máximo ${VALIDATION_RULES.MAX_AUDIOS} áudios` 
            };
        }
        
        // Validar duração de cada áudio
        for (const audio of audios) {
            if (audio.duracao) {
                if (audio.duracao < VALIDATION_RULES.MIN_AUDIO_DURATION_SEC || 
                    audio.duracao > VALIDATION_RULES.MAX_AUDIO_DURATION_SEC) {
                    return { 
                        valid: false, 
                        error: `Áudio deve ter entre ${VALIDATION_RULES.MIN_AUDIO_DURATION_SEC} e ${VALIDATION_RULES.MAX_AUDIO_DURATION_SEC} segundos` 
                    };
                }
            }
        }
        
        return { valid: true };
    }

    /**
     * Valida perfis (máximo 2)
     */
    static validatePerfis(perfis) {
        if (!Array.isArray(perfis)) {
            return { valid: false, error: 'Perfis deve ser um array' };
        }
        
        if (perfis.length > VALIDATION_RULES.MAX_PERFIS) {
            return { 
                valid: false, 
                error: `Anúncio pode ter no máximo ${VALIDATION_RULES.MAX_PERFIS} perfis` 
            };
        }
        
        return { valid: true };
    }

    /**
     * Valida especialidades (máximo 3)
     */
    static validateEspecialidades(especialidades) {
        if (!Array.isArray(especialidades)) {
            return { valid: false, error: 'Especialidades deve ser um array' };
        }
        
        if (especialidades.length > VALIDATION_RULES.MAX_ESpecialidades) {
            return { 
                valid: false, 
                error: `Anúncio pode ter no máximo ${VALIDATION_RULES.MAX_ESpecialidades} especialidades` 
            };
        }
        
        return { valid: true };
    }

    /**
     * Valida categorias (máximo 3)
     */
    static validateCategorias(categorias) {
        if (!Array.isArray(categorias)) {
            return { valid: false, error: 'Categorias deve ser um array' };
        }
        
        if (categorias.length > VALIDATION_RULES.MAX_CATEGORIAS) {
            return { 
                valid: false, 
                error: `Anúncio pode ter no máximo ${VALIDATION_RULES.MAX_CATEGORIAS} categorias` 
            };
        }
        
        return { valid: true };
    }

    /**
     * Valida formas de pagamento (pelo menos 1 obrigatória)
     */
    static validateFormasPagamento(formasPagamento) {
        if (!Array.isArray(formasPagamento)) {
            return { valid: false, error: 'Formas de pagamento deve ser um array' };
        }
        
        if (formasPagamento.length === 0) {
            return { 
                valid: false, 
                error: 'Anúncio deve ter pelo menos uma forma de pagamento' 
            };
        }
        
        return { valid: true };
    }

    /**
     * Validação completa do anúncio
     */
    static validateAnuncio(anuncio) {
        const errors = [];
        
        // Validar campos básicos
        const nomeValidation = this.validateNomeAnuncio(anuncio.nome_anuncio);
        if (!nomeValidation.valid) errors.push(nomeValidation.error);
        
        const descricaoValidation = this.validateDescricao(anuncio.descricao);
        if (!descricaoValidation.valid) errors.push(descricaoValidation.error);
        
        const idadeValidation = this.validateIdade(anuncio.idade);
        if (!idadeValidation.valid) errors.push(idadeValidation.error);
        
        // Validar mídias
        if (anuncio.fotos) {
            const fotosValidation = this.validateFotos(anuncio.fotos);
            if (!fotosValidation.valid) errors.push(fotosValidation.error);
        }
        
        if (anuncio.videos) {
            const videosValidation = this.validateVideos(anuncio.videos);
            if (!videosValidation.valid) errors.push(videosValidation.error);
        }
        
        if (anuncio.audios) {
            const audiosValidation = this.validateAudios(anuncio.audios);
            if (!audiosValidation.valid) errors.push(audiosValidation.error);
        }
        
        // Validar relacionamentos
        if (anuncio.perfis) {
            const perfisValidation = this.validatePerfis(anuncio.perfis);
            if (!perfisValidation.valid) errors.push(perfisValidation.error);
        }
        
        if (anuncio.especialidades) {
            const especialidadesValidation = this.validateEspecialidades(anuncio.especialidades);
            if (!especialidadesValidation.valid) errors.push(especialidadesValidation.error);
        }
        
        if (anuncio.categorias) {
            const categoriasValidation = this.validateCategorias(anuncio.categorias);
            if (!categoriasValidation.valid) errors.push(categoriasValidation.error);
        }
        
        if (anuncio.formas_pagamento) {
            const formasValidation = this.validateFormasPagamento(anuncio.formas_pagamento);
            if (!formasValidation.valid) errors.push(formasValidation.error);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnuncioValidator, VALIDATION_RULES };
}

// =====================================================
// FIM DO ARQUIVO
// =====================================================



