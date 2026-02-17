#!/usr/bin/env node

/**
 * Reversão Completa das Mudanças
 * Volta ao estado anterior onde funcionava com as 3 mensagens
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arquivoHTML = path.join(__dirname, '../frontend/src/modelo-cadastro-anuncios.html');

console.log('🔄 Revertendo todas as mudanças...');

try {
  // Ler o arquivo atual
  let conteudo = fs.readFileSync(arquivoHTML, 'utf8');
  
  console.log('📄 Arquivo lido com sucesso');
  
  // 1. Remover todos os sistemas que adicionamos
  console.log('🧹 Removendo sistemas adicionados...');
  
  // Remover sistema robusto de mensagens
  conteudo = conteudo.replace(
    /<!-- Sistema Único de Mensagens -->[\s\S]*?console\.log\('🛡️ Sistema robusto de mensagens únicas carregado'\);/g,
    ''
  );
  
  // Remover sistema de estados e cidades que adicionamos
  conteudo = conteudo.replace(
    /<!-- Sistema de Estados e Cidades - Funcionalidade Restaurada -->[\s\S]*?console\.log\('✅ Sistema de estados e cidades inicializado com sucesso!'\);/g,
    ''
  );
  
  // Remover sistema único de event listeners
  conteudo = conteudo.replace(
    /<!-- Sistema único de event listeners -->[\s\S]*?console\.log\('🚀 Sistema único inicializado'\);/g,
    ''
  );
  
  // 2. Restaurar as mensagens originais
  console.log('🔄 Restaurando mensagens originais...');
  
  // Restaurar primeira mensagem
  conteudo = conteudo.replace(
    /\/\/ Mensagem removida - usando sistema único/g,
    `alert("✅ Anúncio criado com sucesso! Redirecionando...");
            
            // Redirecionar para a página modificada
            window.location.href = "anunciar_GP_02_modificado.html";`
  );
  
  // Restaurar segunda mensagem
  conteudo = conteudo.replace(
    /\/\/ Mensagem removida - sistema único ativo/g,
    `alert("✅ Anúncio criado com sucesso! Você será redirecionado para sua página de anúncios.");`
  );
  
  // Restaurar terceira mensagem
  conteudo = conteudo.replace(
    /\/\/ Mensagem removida - usando sistema único/g,
    `alert("Cadastro concluído! Você será redirecionado para sua página de anúncios.");
          window.location.href = redirectUrl;`
  );
  
  // 3. Restaurar event listeners originais
  console.log('🔄 Restaurando event listeners originais...');
  
  // Restaurar DOMContentLoaded original
  const sistemaOriginal = `
    <script>
      // Script para carregar estados e cidades usando API do IBGE
      document.addEventListener("DOMContentLoaded", function () {
        console.log("🚀 DOMContentLoaded executado!");

        // Configurar validação de descrição
        const descricaoTextarea = document.getElementById("descricao");
        const charCount = document.getElementById("charCount");
        const charWarning = document.getElementById("charWarning");
        const charSuccess = document.getElementById("charSuccess");
        const charsNeeded = document.getElementById("charsNeeded");

        // Adicionar event listeners para as opções de categoria
        const categoriaRadios = document.querySelectorAll('input[name="category"]');
        categoriaRadios.forEach(radio => {
          radio.addEventListener('change', atualizarLimiteCaracteres);
        });

        // Configurar limite inicial baseado na categoria já selecionada (se houver)
        atualizarLimiteCaracteres();

        // Adicionar event listener para controlar limite manualmente
        descricaoTextarea.addEventListener('input', controlarLimiteCaracteres);

        const MIN_CHARS = 250;
        let MAX_CHARS = 1000; // TODAS as categorias agora têm limite de 1000 caracteres

        // Função para atualizar o limite de caracteres baseado na categoria
        function atualizarLimiteCaracteres() {
          const categoriaSelecionada = document.querySelector('input[name="category"]:checked');
          
          if (categoriaSelecionada) {
            const categoria = categoriaSelecionada.value;
            
            // TODAS as categorias agora têm limite de 1000 caracteres
            MAX_CHARS = 1000;
            
            // Atualizar elementos da interface
            if (charCount) {
              charCount.textContent = descricaoTextarea.value.length;
            }
            
            if (charsNeeded) {
              charsNeeded.textContent = Math.max(0, MIN_CHARS - descricaoTextarea.value.length);
            }
            
            // Atualizar classes de validação
            atualizarClassesValidacao();
          }
        }

        // Função para controlar limite de caracteres manualmente
        function controlarLimiteCaracteres() {
          const currentLength = descricaoTextarea.value.length;
          
          // Atualizar contador
          if (charCount) {
            charCount.textContent = currentLength;
          }
          
          // Atualizar caracteres necessários
          if (charsNeeded) {
            charsNeeded.textContent = Math.max(0, MIN_CHARS - currentLength);
          }
          
          // Atualizar classes de validação
          atualizarClassesValidacao();
        }

        // Função para atualizar classes de validação
        function atualizarClassesValidacao() {
          const currentLength = descricaoTextarea.value.length;
          
          // Remover classes anteriores
          descricaoTextarea.classList.remove('success', 'warning', 'error');
          if (charWarning) charWarning.classList.remove('show');
          if (charSuccess) charSuccess.classList.remove('show');
          
          if (currentLength < MIN_CHARS) {
            // Muito pouco texto
            descricaoTextarea.classList.add('error');
            if (charWarning) charWarning.classList.add('show');
          } else if (currentLength > MAX_CHARS) {
            // Muito texto
            descricaoTextarea.classList.add('warning');
            if (charWarning) charWarning.classList.add('show');
          } else {
            // Texto adequado
            descricaoTextarea.classList.add('success');
            if (charSuccess) charSuccess.classList.add('show');
          }
        }

        // Configurar intl-tel-input para telefones
        const telefoneInput = document.getElementById('telefone_celular');
        if (telefoneInput) {
          // Configurar intl-tel-input
          const iti = window.intlTelInput(telefoneInput, {
            initialCountry: 'br',
            preferredCountries: ['br', 'us'],
            utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
          });

          // Adicionar event listener para mudança de país
          telefoneInput.addEventListener('countrychange', function() {
            const countryData = iti.getSelectedCountryData();
            console.log('País selecionado:', countryData.name);
          });

          console.log("📞 intl-tel-input configurado com sucesso!");
        }

        const estadoSelect = document.getElementById("estado");
        const cidadeSelect = document.getElementById("cidade");

        console.log("📋 Estado select:", estadoSelect);
        console.log("🏙️ Cidade select:", cidadeSelect);

        if (!estadoSelect || !cidadeSelect) {
          console.error("❌ Elementos não encontrados!");
          return;
        }

        console.log("✅ Elementos encontrados com sucesso!");

        // Carregar estados da API do IBGE
        async function carregarEstados() {
          try {
            console.log("🌐 Carregando estados da API do IBGE...");
            const response = await fetch(
              "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
            );
            const estados = await response.json();

            // Limpar select de estados
            estadoSelect.innerHTML =
              '<option value="">Selecione um estado</option>';

            // Ordenar estados por nome
            estados.sort((a, b) => a.nome.localeCompare(b.nome));

            // Adicionar estados ao select
            estados.forEach((estado) => {
              const option = document.createElement("option");
              option.value = estado.sigla;
              option.textContent = estado.nome;
              estadoSelect.appendChild(option);
            });

            console.log(\`✅ \${estados.length} estados carregados com sucesso!\`);
          } catch (error) {
            console.error("❌ Erro ao carregar estados:", error);
          }
        }

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
          TO: ["Palmas", "Araguaína", "Gurupi"],
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

        // Carregar cidades da API do IBGE baseado no estado
        async function carregarCidades(uf) {
          try {
            // Se for Distrito Federal, usar cidades específicas
            if (uf === "DF") {
              console.log("🏛️ Carregando cidades específicas do DF...");

              // Limpar select de cidades
              cidadeSelect.innerHTML =
                '<option value="">Selecione uma cidade</option>';

              // Adicionar cidades do DF
              cidadesDF.forEach((cidade) => {
                const option = document.createElement("option");
                option.value = cidade.toLowerCase().replace(/\\s+/g, "-");
                option.textContent = cidade;
                cidadeSelect.appendChild(option);
              });

              console.log(
                \`✅ \${cidadesDF.length} cidades do DF carregadas com sucesso!\`
              );
              return;
            }

            console.log(\`🌐 Carregando cidades de \${uf} da API do IBGE...\`);
            const response = await fetch(
              \`https://servicodados.ibge.gov.br/api/v1/localidades/estados/\${uf}/municipios\`
            );
            const cidades = await response.json();

            // Limpar select de cidades
            cidadeSelect.innerHTML =
              '<option value="">Selecione uma cidade</option>';

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

            console.log(
              \`✅ \${cidades.length} cidades de \${uf} carregadas com sucesso! (\${cidadesPopulosas.length} principais primeiro)\`
            );
          } catch (error) {
            console.error(\`❌ Erro ao carregar cidades de \${uf}:\`, error);
          }
        }

        // Event listener para mudança de estado
        estadoSelect.addEventListener("change", function () {
          const estadoSelecionado = this.value;
          console.log(\`🔄 Estado selecionado: \${estadoSelecionado}\`);

          if (estadoSelecionado) {
            carregarCidades(estadoSelecionado);
          } else {
            cidadeSelect.innerHTML =
              '<option value="">Selecione uma cidade</option>';
          }
        });

        // Carregar estados ao inicializar
        carregarEstados();
      });
    </script>
  `;
  
  // Inserir sistema original antes do fechamento do body
  conteudo = conteudo.replace('</body>', sistemaOriginal + '\n</body>');
  
  // 4. Limpar comentários de remoção
  console.log('🧹 Limpando comentários de remoção...');
  conteudo = conteudo.replace(/\/\/ Event listener removido - usando sistema único/g, '');
  conteudo = conteudo.replace(/\/\/ Alert removido/g, '');
  
  // Salvar arquivo modificado
  fs.writeFileSync(arquivoHTML, conteudo, 'utf8');
  
  console.log('✅ Reversão completa realizada!');
  console.log('📋 Mudanças revertidas:');
  console.log('   - Removidos sistemas adicionados');
  console.log('   - Restauradas mensagens originais (3 mensagens)');
  console.log('   - Restaurados event listeners originais');
  console.log('   - Restaurado sistema de estados e cidades');
  console.log('   - Volta ao estado funcional anterior');
  
} catch (error) {
  console.error('❌ Erro ao reverter mudanças:', error.message);
}
