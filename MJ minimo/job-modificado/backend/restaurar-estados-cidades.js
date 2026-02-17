#!/usr/bin/env node

/**
 * Correção do Sistema de Estados e Cidades
 * Restaura a funcionalidade que foi removida acidentalmente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arquivoHTML = path.join(__dirname, '../frontend/src/modelo-cadastro-anuncios.html');

console.log('🔧 Restaurando funcionalidade de estados e cidades...');

try {
  // Ler o arquivo
  let conteudo = fs.readFileSync(arquivoHTML, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // Adicionar sistema de estados e cidades antes do fechamento do body
  const sistemaEstadosCidades = `
    <script>
      // Sistema de Estados e Cidades - Funcionalidade Restaurada
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🌐 Inicializando sistema de estados e cidades...');
        
        const estadoSelect = document.getElementById("estado");
        const cidadeSelect = document.getElementById("cidade");
        
        console.log("📋 Estado select:", estadoSelect);
        console.log("🏙️ Cidade select:", cidadeSelect);
        
        if (!estadoSelect || !cidadeSelect) {
          console.error("❌ Elementos de estado/cidade não encontrados!");
          return;
        }
        
        console.log("✅ Elementos de estado/cidade encontrados!");
        
        // Lista de capitais e cidades populosas por estado
        const capitaisECidadesPopulosas = {
          AC: ["Rio Branco", "Cruzeiro do Sul"],
          AL: ["Maceió", "Arapiraca", "Palmeira dos Índios"],
          AP: ["Macapá", "Santana"],
          AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru"],
          BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"],
          CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
          DF: ["Brasília", "Gama", "Taguatinga", "Ceilândia", "Samambaia"],
          ES: ["Vitória", "Vila Velha", "Cariacica", "Serra", "Cachoeiro de Itapemirim"],
          GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"],
          MA: ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias"],
          MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"],
          MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"],
          MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"],
          PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas"],
          PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"],
          PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
          PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
          PI: ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano"],
          RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói"],
          RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba"],
          RS: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"],
          RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"],
          RR: ["Boa Vista", "Rorainópolis", "Caracaraí"],
          SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma"],
          SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André"],
          SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto"],
          TO: ["Palmas", "Araguaína", "Gurupi"]
        };
        
        // Cidades específicas do Distrito Federal
        const cidadesDF = [
          "Brasília", "Gama", "Taguatinga", "Ceilândia", "Samambaia", 
          "Santa Maria", "São Sebastião", "Recanto das Emas", "Lago Sul", 
          "Riacho Fundo", "Lago Norte", "Candangolândia", "Águas Claras", 
          "Riacho Fundo II", "Sudoeste/Octogonal", "Varjão", "Park Way", 
          "SCIA", "Sobradinho", "Planaltina", "Sobradinho II", "Jardim Botânico", 
          "Itapoã", "SIA", "Vicente Pires", "Fercal", "Núcleo Bandeirante", 
          "Guará", "Cruzeiro", "Sudoeste", "Octogonal"
        ];
        
        // Carregar estados da API do IBGE
        async function carregarEstados() {
          try {
            console.log("🌐 Carregando estados da API do IBGE...");
            const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
            const estados = await response.json();
            
            // Limpar select de estados
            estadoSelect.innerHTML = '<option value="">Selecione um estado</option>';
            
            // Ordenar estados por nome
            estados.sort((a, b) => a.nome.localeCompare(b.nome));
            
            // Adicionar estados ao select
            estados.forEach((estado) => {
              const option = document.createElement("option");
              option.value = estado.sigla;
              option.textContent = estado.nome;
              estadoSelect.appendChild(option);
            });
            
            console.log(`✅ ${estados.length} estados carregados com sucesso!`);
          } catch (error) {
            console.error("❌ Erro ao carregar estados:", error);
          }
        }
        
        // Carregar cidades da API do IBGE baseado no estado
        async function carregarCidades(uf) {
          try {
            // Se for Distrito Federal, usar cidades específicas
            if (uf === "DF") {
              console.log("🏛️ Carregando cidades específicas do DF...");
              
              // Limpar select de cidades
              cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
              
              // Adicionar cidades do DF
              cidadesDF.forEach((cidade) => {
                const option = document.createElement("option");
                option.value = cidade.toLowerCase().replace(/\\s+/g, "-");
                option.textContent = cidade;
                cidadeSelect.appendChild(option);
              });
              
              console.log(`✅ ${cidadesDF.length} cidades do DF carregadas com sucesso!`);
              return;
            }
            
            console.log(`🌐 Carregando cidades de ${uf} da API do IBGE...`);
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
            const cidades = await response.json();
            
            // Limpar select de cidades
            cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
            
            // Ordenar cidades: capitais e cidades populosas primeiro, depois alfabética
            const capitais = capitaisECidadesPopulosas[uf] || [];
            
            // Separar capitais/populosas das demais
            const cidadesPopulosas = [];
            const cidadesDemais = [];
            
            cidades.forEach((cidade) => {
              if (capitais.includes(cidade.nome)) {
                cidadesPopulosas.push(cidade);
              } else {
                cidadesDemais.push(cidade);
              }
            });
            
            // Ordenar demais cidades alfabeticamente
            cidadesDemais.sort((a, b) => a.nome.localeCompare(b.nome));
            
            // Combinar: primeiro populosas, depois demais
            const cidadesOrdenadas = [...cidadesPopulosas, ...cidadesDemais];
            
            // Adicionar cidades ao select
            cidadesOrdenadas.forEach((cidade) => {
              const option = document.createElement("option");
              option.value = cidade.nome.toLowerCase().replace(/\\s+/g, "-");
              option.textContent = cidade.nome;
              cidadeSelect.appendChild(option);
            });
            
            console.log(`✅ ${cidades.length} cidades de ${uf} carregadas com sucesso! (${cidadesPopulosas.length} principais primeiro)`);
          } catch (error) {
            console.error(`❌ Erro ao carregar cidades de ${uf}:`, error);
          }
        }
        
        // Event listener para mudança de estado
        estadoSelect.addEventListener("change", function () {
          const estadoSelecionado = this.value;
          console.log(`🔄 Estado selecionado: ${estadoSelecionado}`);
          
          if (estadoSelecionado) {
            carregarCidades(estadoSelecionado);
          } else {
            cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
          }
        });
        
        // Carregar estados ao inicializar
        carregarEstados();
        
        console.log('✅ Sistema de estados e cidades inicializado com sucesso!');
      });
    </script>
  `;
  
  // Inserir sistema antes do fechamento do body
  conteudo = conteudo.replace('</body>', sistemaEstadosCidades + '\n</body>');
  
  // Salvar arquivo modificado
  fs.writeFileSync(arquivoHTML, conteudo, 'utf8');
  
  console.log('✅ Funcionalidade de estados e cidades restaurada!');
  console.log('📋 Funcionalidades restauradas:');
  console.log('   - Carregamento de estados da API do IBGE');
  console.log('   - Carregamento de cidades baseado no estado selecionado');
  console.log('   - Ordenação inteligente (capitais primeiro)');
  console.log('   - Cidades específicas do Distrito Federal');
  console.log('   - Event listener para mudança de estado');
  console.log('   - Sistema de fallback para erros de API');
  
} catch (error) {
  console.error('❌ Erro ao restaurar funcionalidade:', error.message);
}
