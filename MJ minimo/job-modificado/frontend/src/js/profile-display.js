/**
 * SCRIPT PARA MOSTRAR TIPO DE PERFIL NAS PÁGINAS DESTINO
 * 
 * Este script lê os dados salvos no localStorage e exibe
 * o tipo de perfil do usuário na página atual.
 * 
 * Como usar:
 * 1. Inclua este arquivo nas páginas de anúncio
 * 2. Ou copie o código diretamente no final de cada página
 */

document.addEventListener("DOMContentLoaded", () => {
  const gender = localStorage.getItem("userGender");
  const category = localStorage.getItem("userCategory");

  if (gender && category) {
    console.log("Perfil atual:", gender, "+", category);

    // Exibir no console para debug
    console.log(`📍 Perfil detectado: ${gender.toUpperCase()} + ${category.toUpperCase()}`);

    // Exemplo 1: Exibir no título da página
    const header = document.querySelector(".ficha-top-line span");
    if (header) {
      header.innerText = `📍 ${gender.toUpperCase()} + ${category.toUpperCase()}`;
    }

    // Exemplo 2: Exibir em um elemento com ID específico
    const profileDisplay = document.getElementById("profile-display");
    if (profileDisplay) {
      profileDisplay.innerHTML = `
        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #007bff;">
          <strong>Perfil Atual:</strong> ${gender.toUpperCase()} + ${category.toUpperCase()}
        </div>
      `;
    }

    // Exemplo 3: Exibir no topo da página como banner
    const pageTitle = document.querySelector("h1, .page-title");
    if (pageTitle) {
      const profileBanner = document.createElement("div");
      profileBanner.style.cssText = `
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        padding: 8px 15px;
        border-radius: 5px;
        margin-bottom: 20px;
        font-size: 14px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      profileBanner.innerHTML = `🎯 Perfil: ${gender.toUpperCase()} + ${category.toUpperCase()}`;
      pageTitle.parentNode.insertBefore(profileBanner, pageTitle.nextSibling);
    }

    // Exemplo 4: Adicionar classe CSS para estilização específica
    document.body.classList.add(`profile-${gender}`, `category-${category}`);

    // Exemplo 5: Filtrar conteúdo baseado no perfil (se necessário)
    if (category === "acompanhantes" && gender === "mulher") {
      console.log("Mostrando anúncios premium para mulheres");
    } else if (category === "massagistas") {
      console.log("Mostrando anúncios de massagistas");
    } else if (category === "sexo-virtual") {
      console.log("Mostrando anúncios de sexo virtual");
    }
  } else {
    console.log("Nenhum perfil detectado no localStorage");
  }
});

/**
 * FUNÇÃO AUXILIAR: Limpar dados do perfil
 * Use esta função se quiser permitir que o usuário troque de perfil
 */
function clearProfileData() {
  localStorage.removeItem("userGender");
  localStorage.removeItem("userCategory");
  console.log("Dados do perfil limpos");
  // Recarregar a página ou redirecionar
  window.location.reload();
}

/**
 * FUNÇÃO AUXILIAR: Obter dados do perfil atual
 * Retorna um objeto com os dados do perfil ou null se não existir
 */
function getCurrentProfile() {
  const gender = localStorage.getItem("userGender");
  const category = localStorage.getItem("userCategory");
  
  if (gender && category) {
    return {
      gender: gender,
      category: category,
      displayName: `${gender.toUpperCase()} + ${category.toUpperCase()}`
    };
  }
  
  return null;
}
