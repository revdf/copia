/**
 * Script para testar todas as páginas de cadastro
 * Preenche todos os campos e captura os dados que serão salvos
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const BASE_URL = 'http://127.0.0.1:5500/job-modificado/frontend/src';
const OUTPUT_FILE = path.join(__dirname, 'dados-cadastros-testados.txt');

// Lista de páginas para testar
const PAGINAS = [
  {
    url: `${BASE_URL}/selecao-categoria.html`,
    nome: 'Seleção de Categoria',
    tipo: 'selecao'
  },
  {
    url: `${BASE_URL}/A_02__premium_Anuncio_modelo_01_COPY.html`,
    nome: 'Mulher + Acompanhantes',
    tipo: 'cadastro',
    genero: 'mulher',
    categoria: 'acompanhantes'
  },
  {
    url: `${BASE_URL}/A_02__premium_Anuncio_modelo_01_COPY_Massagista.html`,
    nome: 'Mulher + Massagistas',
    tipo: 'cadastro',
    genero: 'mulher',
    categoria: 'massagistas'
  },
  {
    url: `${BASE_URL}/A_02__premium_Anuncio-Sexo_Virtual.html`,
    nome: 'Mulher + Sexo Virtual',
    tipo: 'cadastro',
    genero: 'mulher',
    categoria: 'sexo-virtual'
  },
  {
    url: `${BASE_URL}/A_02__premium_Anuncio_perfil-trans.html`,
    nome: 'Trans + Acompanhantes',
    tipo: 'cadastro',
    genero: 'trans',
    categoria: 'acompanhantes'
  },
  {
    url: `${BASE_URL}/A_02__premium_Anuncio_perfil-trans-Massagista.html`,
    nome: 'Trans + Massagistas',
    tipo: 'cadastro',
    genero: 'trans',
    categoria: 'massagistas'
  },
  {
    url: `${BASE_URL}/A_02__premium_Anuncio_perfil-homens.html`,
    nome: 'Homem + Acompanhantes',
    tipo: 'cadastro',
    genero: 'homem',
    categoria: 'acompanhantes'
  },
  {
    url: `${BASE_URL}/A_02__premium_Anuncio_perfil-homens-Massagista.html`,
    nome: 'Homem + Massagistas',
    tipo: 'cadastro',
    genero: 'homem',
    categoria: 'massagistas'
  },
  {
    url: `${BASE_URL}/Perfil-Cadastro-LUXO.html`,
    nome: 'Mulher de Luxo + Acompanhantes',
    tipo: 'cadastro',
    genero: 'mulher-luxo',
    categoria: 'acompanhantes'
  },
  {
    url: `${BASE_URL}/Perfil-Cadastro-Massagem-de-LUXO.html`,
    nome: 'Mulher de Luxo + Massagistas',
    tipo: 'cadastro',
    genero: 'mulher-luxo',
    categoria: 'massagistas'
  }
];

// Texto longo para descrições
const TEXTO_DESCRICAO = `
Profissional experiente e dedicada, oferecendo serviços de alta qualidade com total discrição e profissionalismo. 
Ambiente aconchegante e seguro, com toda a infraestrutura necessária para proporcionar uma experiência única e memorável.
Atendimento personalizado, respeitando sempre os limites e preferências de cada cliente.
Disponibilidade flexível para melhor atender suas necessidades.
Localização de fácil acesso, com estacionamento disponível.
Aceito diversas formas de pagamento para sua comodidade.
Entre em contato e agende seu horário. Estou ansiosa para conhecê-lo!
`.trim();

/**
 * Preenche todos os campos de um formulário
 */
async function preencherFormulario(page) {
  console.log('📝 Preenchendo campos do formulário...');

  // Aguardar página carregar
  await page.waitForTimeout(2000);

  // Preencher inputs de texto
  const inputs = await page.$$eval('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]', inputs => {
    return inputs.map(input => ({
      id: input.id,
      name: input.name,
      type: input.type,
      placeholder: input.placeholder,
      maxLength: input.maxLength
    }));
  });

  for (const input of inputs) {
    try {
      let value = '';
      
      if (input.type === 'email') {
        value = 'teste@exemplo.com';
      } else if (input.type === 'tel') {
        value = '(61) 99999-9999';
      } else if (input.type === 'number') {
        value = '25';
      } else if (input.id?.includes('nome') || input.name?.includes('nome')) {
        value = 'Maria Silva';
      } else if (input.id?.includes('descricao') || input.name?.includes('descricao')) {
        value = TEXTO_DESCRICAO;
      } else if (input.id?.includes('bairro') || input.name?.includes('bairro')) {
        value = 'Asa Norte';
      } else if (input.id?.includes('altura') || input.name?.includes('altura')) {
        value = '1.65m';
      } else if (input.id?.includes('peso') || input.name?.includes('peso')) {
        value = '60kg';
      } else {
        value = 'Teste de preenchimento automático';
      }

      if (input.maxLength && value.length > input.maxLength) {
        value = value.substring(0, input.maxLength);
      }

      await page.evaluate((id, val) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, input.id, value);
      console.log(`  ✓ Preenchido: ${input.id || input.name} = ${value.substring(0, 50)}...`);
    } catch (error) {
      // Ignorar erros de campos que não existem
    }
  }

  // Preencher textareas
  const textareas = await page.$$eval('textarea', textareas => {
    return textareas.map(ta => ({
      id: ta.id,
      name: ta.name
    }));
  });

  for (const textarea of textareas) {
    try {
      await page.evaluate((id, val) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, textarea.id, TEXTO_DESCRICAO);
      console.log(`  ✓ Preenchido textarea: ${textarea.id || textarea.name}`);
    } catch (error) {
      // Ignorar erros
    }
  }

  // Selecionar todos os selects
  const selects = await page.$$eval('select', selects => {
    return selects.map(select => ({
      id: select.id,
      name: select.name,
      options: Array.from(select.options).map(opt => ({
        value: opt.value,
        text: opt.text
      }))
    }));
  });

  for (const select of selects) {
    try {
      // Pegar primeira opção válida (não vazia)
      const primeiraOpcao = select.options.find(opt => opt.value && opt.value !== '');
      if (primeiraOpcao) {
        await page.evaluate((id, val) => {
          const el = document.getElementById(id);
          if (el) {
            el.value = val;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, select.id, primeiraOpcao.value);
        console.log(`  ✓ Selecionado: ${select.id || select.name} = ${primeiraOpcao.text}`);
      }
    } catch (error) {
      // Ignorar erros
    }
  }

  // Marcar todos os checkboxes
  const checkboxes = await page.$$eval('input[type="checkbox"]', checkboxes => {
    return checkboxes.map(cb => ({
      id: cb.id,
      name: cb.name,
      value: cb.value,
      checked: cb.checked
    }));
  });

  for (const checkbox of checkboxes) {
    try {
      if (!checkbox.checked) {
        await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, checkbox.id);
        console.log(`  ✓ Marcado checkbox: ${checkbox.id || checkbox.name}`);
      }
    } catch (error) {
      // Tentar por name se id não funcionar
      try {
        await page.evaluate((name, val) => {
          const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
          if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, checkbox.name, checkbox.value);
      } catch (e) {
        // Ignorar
      }
    }
  }

  // Marcar todos os radio buttons (primeiro de cada grupo)
  const radios = await page.$$eval('input[type="radio"]', radios => {
    const grupos = {};
    radios.forEach(radio => {
      const name = radio.name;
      if (!grupos[name]) {
        grupos[name] = [];
      }
      grupos[name].push({
        id: radio.id,
        value: radio.value
      });
    });
    return grupos;
  });

  for (const [name, options] of Object.entries(radios)) {
    try {
      if (options.length > 0) {
        await page.evaluate((name, val) => {
          const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
          if (el) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, name, options[0].value);
        console.log(`  ✓ Marcado radio: ${name} = ${options[0].value}`);
      }
    } catch (error) {
      // Ignorar
    }
  }

  // Abrir todos os accordions
  const accordions = await page.$$eval('.accordion-header', headers => {
    return headers.map(h => ({
      onclick: h.getAttribute('onclick'),
      text: h.textContent.trim()
    }));
  });

  for (const accordion of accordions) {
    try {
      await page.click('.accordion-header');
      await page.waitForTimeout(300);
      console.log(`  ✓ Aberto accordion: ${accordion.text.substring(0, 30)}...`);
    } catch (error) {
      // Ignorar
    }
  }

  await page.waitForTimeout(1000);
}

/**
 * Captura os dados do formulário antes do envio
 */
async function capturarDadosFormulario(page) {
  console.log('📊 Capturando dados do formulário...');

  const dados = {
    timestamp: new Date().toISOString(),
    url: page.url(),
    inputs: {},
    selects: {},
    checkboxes: {},
    radios: {},
    textareas: {}
  };

  // Capturar inputs
  const inputs = await page.$$eval('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="password"]', inputs => {
    return inputs.map(input => ({
      id: input.id,
      name: input.name,
      type: input.type,
      value: input.value
    }));
  });

  inputs.forEach(input => {
    if (input.value) {
      dados.inputs[input.id || input.name] = input.value;
    }
  });

  // Capturar selects
  const selects = await page.$$eval('select', selects => {
    return selects.map(select => ({
      id: select.id,
      name: select.name,
      value: select.value,
      text: select.options[select.selectedIndex]?.text
    }));
  });

  selects.forEach(select => {
    if (select.value) {
      dados.selects[select.id || select.name] = {
        value: select.value,
        text: select.text
      };
    }
  });

  // Capturar checkboxes marcados
  const checkboxes = await page.$$eval('input[type="checkbox"]:checked', checkboxes => {
    return checkboxes.map(cb => ({
      id: cb.id,
      name: cb.name,
      value: cb.value
    }));
  });

  checkboxes.forEach(checkbox => {
    const key = checkbox.id || checkbox.name;
    if (!dados.checkboxes[key]) {
      dados.checkboxes[key] = [];
    }
    dados.checkboxes[key].push(checkbox.value);
  });

  // Capturar radios marcados
  const radios = await page.$$eval('input[type="radio"]:checked', radios => {
    return radios.map(radio => ({
      name: radio.name,
      value: radio.value
    }));
  });

  radios.forEach(radio => {
    dados.radios[radio.name] = radio.value;
  });

  // Capturar textareas
  const textareas = await page.$$eval('textarea', textareas => {
    return textareas.map(ta => ({
      id: ta.id,
      name: ta.name,
      value: ta.value
    }));
  });

  textareas.forEach(textarea => {
    if (textarea.value) {
      dados.textareas[textarea.id || textarea.name] = textarea.value;
    }
  });

  return dados;
}

/**
 * Testa uma página
 */
async function testarPagina(browser, pagina) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testando: ${pagina.nome}`);
  console.log(`📍 URL: ${pagina.url}`);
  console.log('='.repeat(80));

  const page = await browser.newPage();
  const dadosEnviados = [];

  try {
    // Interceptar requisições
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      const method = request.method();
      const postData = request.postData();

      if ((method === 'POST' || method === 'PUT') && postData) {
        try {
          const dados = JSON.parse(postData);
          dadosEnviados.push({
            url,
            method,
            dados,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          dadosEnviados.push({
            url,
            method,
            dados: postData,
            timestamp: new Date().toISOString()
          });
        }
      }

      request.continue();
    });

    // Navegar para a página
    await page.goto(pagina.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Preencher formulário
    await preencherFormulario(page);

    // Capturar dados do formulário
    const dadosFormulario = await capturarDadosFormulario(page);

    // Tentar encontrar e clicar no botão de submit (mas não enviar de fato)
    try {
      const submitButton = await page.$('button[type="submit"], input[type="submit"], .submit-button, #submit-btn');
      if (submitButton) {
        console.log('  ⚠️ Botão de submit encontrado (não será clicado para evitar envio real)');
      }
    } catch (error) {
      // Ignorar
    }

    return {
      pagina: pagina.nome,
      url: pagina.url,
      tipo: pagina.tipo,
      dadosFormulario,
      dadosEnviados,
      sucesso: true
    };

  } catch (error) {
    console.error(`❌ Erro ao testar ${pagina.nome}:`, error.message);
    return {
      pagina: pagina.nome,
      url: pagina.url,
      tipo: pagina.tipo,
      erro: error.message,
      sucesso: false
    };
  } finally {
    await page.close();
  }
}

/**
 * Salva resultados em arquivo
 */
function salvarResultados(resultados) {
  let conteudo = '';
  conteudo += '='.repeat(100) + '\n';
  conteudo += 'RELATÓRIO DE TESTES - PÁGINAS DE CADASTRO\n';
  conteudo += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
  conteudo += '='.repeat(100) + '\n\n';

  resultados.forEach((resultado, index) => {
    conteudo += `\n${'─'.repeat(100)}\n`;
    conteudo += `PÁGINA ${index + 1}: ${resultado.pagina}\n`;
    conteudo += `URL: ${resultado.url}\n`;
    conteudo += `Tipo: ${resultado.tipo}\n`;
    conteudo += `Status: ${resultado.sucesso ? '✅ SUCESSO' : '❌ ERRO'}\n`;
    conteudo += `${'─'.repeat(100)}\n\n`;

    if (resultado.erro) {
      conteudo += `ERRO: ${resultado.erro}\n\n`;
    } else {
      conteudo += 'DADOS DO FORMULÁRIO:\n';
      conteudo += JSON.stringify(resultado.dadosFormulario, null, 2);
      conteudo += '\n\n';

      if (resultado.dadosEnviados && resultado.dadosEnviados.length > 0) {
        conteudo += 'DADOS ENVIADOS (capturados de requisições):\n';
        resultado.dadosEnviados.forEach((req, i) => {
          conteudo += `\nRequisição ${i + 1}:\n`;
          conteudo += `  URL: ${req.url}\n`;
          conteudo += `  Método: ${req.method}\n`;
          conteudo += `  Dados: ${JSON.stringify(req.dados, null, 2)}\n`;
        });
        conteudo += '\n';
      }
    }
  });

  fs.writeFileSync(OUTPUT_FILE, conteudo, 'utf8');
  console.log(`\n✅ Resultados salvos em: ${OUTPUT_FILE}`);
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando testes das páginas de cadastro...\n');

  const browser = await puppeteer.launch({
    headless: false, // Mostrar navegador para debug
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const resultados = [];

  try {
    for (const pagina of PAGINAS) {
      const resultado = await testarPagina(browser, pagina);
      resultados.push(resultado);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar entre testes
    }
  } finally {
    await browser.close();
  }

  // Salvar resultados
  salvarResultados(resultados);

  console.log('\n✅ Testes concluídos!');
  console.log(`📄 Resultados salvos em: ${OUTPUT_FILE}`);
}

// Executar
main().catch(console.error);
