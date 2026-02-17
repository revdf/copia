/**
 * Mapa de Estados Brasileiros e suas Cidades
 */

const estadosBrasileiros = {
    'AC': { nome: 'Acre', capital: 'Rio Branco', cidades: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'] },
    'AL': { nome: 'Alagoas', capital: 'Maceió', cidades: ['Maceió', 'Arapiraca', 'Palmeira dos Índios'] },
    'AP': { nome: 'Amapá', capital: 'Macapá', cidades: ['Macapá', 'Santana', 'Laranjal do Jari'] },
    'AM': { nome: 'Amazonas', capital: 'Manaus', cidades: ['Manaus', 'Parintins', 'Itacoatiara'] },
    'BA': { nome: 'Bahia', capital: 'Salvador', cidades: ['Salvador', 'Feira de Santana', 'Vitória da Conquista'] },
    'CE': { nome: 'Ceará', capital: 'Fortaleza', cidades: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'] },
    'DF': { 
        nome: 'Distrito Federal', 
        capital: 'Brasília', 
        cidades: [
            'Asa Norte',
            'Asa Sul',
            'Águas Claras',
            'Arniqueira',
            'Bandeirante',
            'Brazlândia',
            'Candangolândia',
            'Ceilândia',
            'Cruzeiro',
            'Gama',
            'Guará',
            'Paranoá',
            'Planaltina',
            'Recanto das Emas',
            'Riacho Fundo',
            'Samambaia',
            'Santa Maria',
            'São Sebastião',
            'Sobradinho',
            'Sudoeste',
            'Octogonal',
            'Taguatinga',
            'Vicente Pires',
            'Itapoã',
            'Jardim Botânico',
            'Lago Norte',
            'Lago Sul',
            'Park Way'
        ]
    },
    'ES': { nome: 'Espírito Santo', capital: 'Vitória', cidades: ['Vitória', 'Vila Velha', 'Cariacica'] },
    'GO': { 
        nome: 'Goiás', 
        capital: 'Goiânia', 
        cidades: [
            'Goiânia',
            'Aparecida de Goiânia',
            'Anápolis',
            'Águas Lindas',
            'Céu Azul',
            'Formosa',
            'Jardim Ingá',
            'Luziânia',
            'Novo Gama',
            'Ocidental',
            'Planaltina',
            'St. Antônio do Descoberto',
            'Valparaíso'
        ]
    },
    'MA': { nome: 'Maranhão', capital: 'São Luís', cidades: ['São Luís', 'Imperatriz', 'Caxias'] },
    'MT': { nome: 'Mato Grosso', capital: 'Cuiabá', cidades: ['Cuiabá', 'Várzea Grande', 'Rondonópolis'] },
    'MS': { nome: 'Mato Grosso do Sul', capital: 'Campo Grande', cidades: ['Campo Grande', 'Dourados', 'Três Lagoas'] },
    'MG': { nome: 'Minas Gerais', capital: 'Belo Horizonte', cidades: ['Belo Horizonte', 'Uberlândia', 'Contagem'] },
    'PA': { nome: 'Pará', capital: 'Belém', cidades: ['Belém', 'Ananindeua', 'Marituba'] },
    'PB': { nome: 'Paraíba', capital: 'João Pessoa', cidades: ['João Pessoa', 'Campina Grande', 'Santa Rita'] },
    'PR': { nome: 'Paraná', capital: 'Curitiba', cidades: ['Curitiba', 'Londrina', 'Maringá'] },
    'PE': { nome: 'Pernambuco', capital: 'Recife', cidades: ['Recife', 'Jaboatão dos Guararapes', 'Olinda'] },
    'PI': { nome: 'Piauí', capital: 'Teresina', cidades: ['Teresina', 'Parnaíba', 'Picos'] },
    'RJ': { nome: 'Rio de Janeiro', capital: 'Rio de Janeiro', cidades: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias'] },
    'RN': { nome: 'Rio Grande do Norte', capital: 'Natal', cidades: ['Natal', 'Mossoró', 'Parnamirim'] },
    'RS': { nome: 'Rio Grande do Sul', capital: 'Porto Alegre', cidades: ['Porto Alegre', 'Caxias do Sul', 'Pelotas'] },
    'RO': { nome: 'Rondônia', capital: 'Porto Velho', cidades: ['Porto Velho', 'Ji-Paraná', 'Ariquemes'] },
    'RR': { nome: 'Roraima', capital: 'Boa Vista', cidades: ['Boa Vista', 'Rorainópolis', 'Caracaraí'] },
    'SC': { nome: 'Santa Catarina', capital: 'Florianópolis', cidades: ['Florianópolis', 'Joinville', 'Blumenau'] },
    'SP': { nome: 'São Paulo', capital: 'São Paulo', cidades: ['São Paulo', 'Guarulhos', 'Campinas'] },
    'SE': { nome: 'Sergipe', capital: 'Aracaju', cidades: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'] },
    'TO': { nome: 'Tocantins', capital: 'Palmas', cidades: ['Palmas', 'Araguaína', 'Gurupi'] }
};

/**
 * Obtém lista de estados
 * @returns {Array} Array de objetos { sigla, nome, capital }
 */
function obterEstados() {
    return Object.keys(estadosBrasileiros).map(sigla => ({
        sigla,
        nome: estadosBrasileiros[sigla].nome,
        capital: estadosBrasileiros[sigla].capital
    }));
}

/**
 * Obtém cidades de um estado
 * @param {string} siglaEstado - Sigla do estado (ex: 'SP', 'RJ')
 * @returns {Array|null} Array de cidades ou null se não encontrado
 */
function obterCidadesEstado(siglaEstado) {
    if (!siglaEstado) return null;
    const estado = estadosBrasileiros[siglaEstado.toUpperCase()];
    return estado ? estado.cidades : null;
}

/**
 * Obtém informações de um estado
 * @param {string} siglaEstado - Sigla do estado
 * @returns {Object|null} Objeto com informações do estado ou null
 */
function obterEstado(siglaEstado) {
    if (!siglaEstado) return null;
    return estadosBrasileiros[siglaEstado.toUpperCase()] || null;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.estadosBrasileiros = estadosBrasileiros;
    window.obterEstados = obterEstados;
    window.obterCidadesEstado = obterCidadesEstado;
    window.obterEstado = obterEstado;
}

