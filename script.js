// =============================================
// ELEMENTOS DA INTERFACE (DOM)
// =============================================
const elements = {
  photoGrid: document.getElementById("photoGrid"), // Container da grade de fotos
  uploadModal: document.getElementById("uploadModal"), // Modal de upload
  addPhotoButton: document.getElementById("addPhotoBtn"), // Botão para abrir modal
  closeButton: document.querySelector(".close"), // Botão para fechar modal
  uploadForm: document.getElementById("uploadForm"), // Formulário de upload
  toast: document.getElementById("toast"), // Elemento para notificações
  nameInput: document.getElementById("name"), // Input do nome da foto
  fileInput: document.getElementById("file"), // Input do arquivo da foto
};

// =============================================
// CONFIGURAÇÕES DA APLICAÇÃO
// =============================================
const config = {
  apiUrl: "https://hospedagem-upl.onrender.com/pictures", // Endpoint da API
  // Imagem padrão para erros
  placeholderImage:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvIGFvIGNhcnJlZ2FyIGltYWdlbTwvdGV4dD48L3N2Zz4=",
};

// =============================================
// FUNÇÕES DE NOTIFICAÇÃO
// =============================================

// Exibe mensagem temporária na tela
function showNotification(message, type = "success") {
  const { toast } = elements;

  toast.textContent = message; // Define mensagem
  toast.className = `toast ${type}`; // Aplica classe de tipo
  toast.style.opacity = "1"; // Mostra notificação

  setTimeout(() => {
    toast.style.opacity = "0"; // Esconde após 3 segundos
  }, 3000);
}

// =============================================
// FUNÇÕES DE MANIPULAÇÃO DE FOTOS
// =============================================

// Busca fotos da API
async function fetchPhotos() {
  try {
    const response = await fetch(config.apiUrl); // Busca fotos da API

    if (!response.ok) {
      throw new Error(`Erro na requisição: status ${response.status}`);
    }

    const data = await response.json();
    return data.pictures || []; // Retorna array de fotos ou vazio
  } catch (error) {
    console.error("Falha ao carregar fotos:", error);
    showNotification("Falha ao carregar fotos", "error");
    return [];
  }
}

// Renderiza as fotos no grid
function renderPhotoGrid(photos) {
  const { photoGrid } = elements;

  photoGrid.innerHTML = ""; // Limpa o conteúdo atual

  if (photos.length === 0) {
    photoGrid.innerHTML = '<p class="no-photos">Nenhuma foto encontrada</p>';
    return;
  }

  photos.forEach((photo) => {
    const photoCard = createPhotoCardElement(photo); // Cria card para cada foto
    photoGrid.appendChild(photoCard); // Adiciona ao grid
  });
}

// Cria o elemento HTML de um card de foto
function createPhotoCardElement(photo) {
  const card = document.createElement("div");
  card.className = "photo-card";

  const imageUrl = `${config.apiUrl}/${photo._id}/image`; // URL da imagem

  // Estrutura HTML do card
  card.innerHTML = `
      <img src="${imageUrl}" alt="${photo.name}" 
           onerror="this.onerror=null; this.src='${config.placeholderImage}'">
      <div class="photo-info">
        <div class="photo-name">${photo.name}</div>
        <button class="btn-delete" data-id="${photo._id}">Excluir</button>
      </div>
    `;

  // Configura evento de exclusão
  card
    .querySelector(".btn-delete")
    .addEventListener("click", () => handlePhotoDeletion(photo._id));

  return card;
}

// =============================================
// FUNÇÕES DE GERENCIAMENTO (CRUD)
// =============================================

// Exclui uma foto após confirmação
async function handlePhotoDeletion(photoId) {
  if (!confirm("Tem certeza que deseja excluir esta foto?")) {
    return;
  }

  try {
    const response = await fetch(`${config.apiUrl}/${photoId}`, {
      method: "DELETE", // Requisição DELETE
    });

    if (!response.ok) {
      throw new Error("Falha ao excluir foto");
    }

    showNotification("Foto excluída com sucesso!");
    loadAndDisplayPhotos(); // Recarrega a lista
  } catch (error) {
    console.error("Erro na exclusão:", error);
    showNotification("Falha ao excluir foto", "error");
  }
}

// Envia nova foto para o servidor
async function uploadNewPhoto(formData) {
  try {
    const response = await fetch(config.apiUrl, {
      method: "POST", // Requisição POST
      body: formData, // Dados do formulário
    });

    if (!response.ok) {
      throw new Error("Falha no upload da foto");
    }

    showNotification("Foto enviada com sucesso!");
    closeUploadModal();
    elements.uploadForm.reset(); // Limpa formulário
    loadAndDisplayPhotos(); // Recarrega a lista
  } catch (error) {
    console.error("Erro no upload:", error);
    showNotification("Falha ao enviar foto", "error");
  }
}

// =============================================
// FUNÇÕES DE CONTROLE DA INTERFACE
// =============================================

// Abre o modal de upload
function openUploadModal() {
  elements.uploadModal.style.display = "block"; // Mostra modal
}

// Fecha o modal de upload
function closeUploadModal() {
  elements.uploadModal.style.display = "none"; // Esconde modal
}

// Fecha modal ao clicar fora dele
function handleOutsideClick(event) {
  // Fecha modal ao clicar fora
  if (event.target === elements.uploadModal) {
    closeUploadModal();
  }
}

// Processa o envio do formulário
function handleFormSubmit(event) {
  event.preventDefault(); // Previne envio padrão

  const formData = new FormData();
  formData.append("name", elements.nameInput.value); // Adiciona nome
  formData.append("file", elements.fileInput.files[0]); // Adiciona arquivo

  uploadNewPhoto(formData); // Envia para API
}

// =============================================
// FUNÇÃO PRINCIPAL DE CARREGAMENTO
// =============================================

// Carrega e exibe todas as fotos
async function loadAndDisplayPhotos() {
  const photos = await fetchPhotos(); // Busca fotos
  renderPhotoGrid(photos); // Exibe no grid
}

// =============================================
// CONFIGURAÇÃO DOS EVENT LISTENERS
// =============================================

// Configura todos os eventos da aplicação
function setupEventListeners() {
  elements.addPhotoButton.addEventListener("click", openUploadModal);
  elements.closeButton.addEventListener("click", closeUploadModal);
  window.addEventListener("click", handleOutsideClick);
  elements.uploadForm.addEventListener("submit", handleFormSubmit);
}

// =============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners(); // Configura eventos
  loadAndDisplayPhotos(); // Carrega fotos iniciais
});
