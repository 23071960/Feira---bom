// Configuração do modal e senha
const modal = document.getElementById('uploadModal');
const openModalBtn = document.getElementById('openUploadModal');
const closeModalBtn = document.querySelector('.close-modal');
const passwordSection = document.querySelector('.password-section');
const uploadForm = document.getElementById('uploadForm');

// Senha permanente (pode ser alterada manualmente no código)
const PASSWORD = "senha123"; // Senha fixa no código

// Abrir modal
openModalBtn.addEventListener('click', () => {
  modal.style.display = 'block';
  passwordSection.style.display = 'block';
  uploadForm.classList.add('hidden');
});

// Fechar modal
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Verificar senha
document.getElementById('confirmPassword').addEventListener('click', () => {
  const enteredPassword = document.getElementById('modalPassword').value;
  
  if (enteredPassword === PASSWORD) {
    passwordSection.style.display = 'none';
    uploadForm.classList.remove('hidden');
    document.getElementById('modalPassword').value = ''; // Limpa o campo de senha
  } else {
    alert('Senha incorreta!');
  }
});

// Preview da imagem
document.getElementById('imageInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById('imagePreview').src = event.target.result;
      document.getElementById('imagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Envio do formulário (substitua pelo seu código de upload para o Supabase)
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Aqui você deve adicionar o código de upload para o Supabase
  
  // Após o upload bem-sucedido:
  modal.style.display = 'none';
  uploadForm.classList.add('hidden');
  passwordSection.style.display = 'block';
  this.reset();
  document.getElementById('imagePreview').style.display = 'none';
  alert('Imagem enviada com sucesso!');
  // Recarregar a galeria se necessário
});