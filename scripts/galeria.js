document.addEventListener('DOMContentLoaded', function() {
    // Constantes de configuração
    const BUCKET_NAME = 'catalogo';
    const TABLE_NAME = 'imagens-catalogo';
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MODAL_PASSWORD = "senha123"; // Senha para acessar o modal

    // Elementos do DOM - Modal
    const modal = document.getElementById('uploadModal');
    const openModalBtn = document.getElementById('openUploadModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const passwordSection = document.querySelector('.password-section');
    const confirmPasswordBtn = document.getElementById('confirmPassword');
    const modalPasswordInput = document.getElementById('modalPassword');

    // Elementos do DOM - Formulário
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const imageTitleInput = document.getElementById('imageTitle');
    const imageDescriptionInput = document.getElementById('imageDescription');

    // Elementos da Galeria
    const galleryContainer = document.getElementById('galleryContainer');

    // ======================
    // FUNÇÕES PRINCIPAIS
    // ======================

    // Carregar galeria de imagens
    async function loadGalleryImages() {
        try {
            galleryContainer.innerHTML = '<p class="loading-message">Carregando imagens...</p>';
            
            const { data: images, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            if (!images || images.length === 0) {
                galleryContainer.innerHTML = '<p class="empty-message">Nenhuma imagem encontrada.</p>';
                return;
            }

            renderGallery(images);
        } catch (error) {
            console.error('Erro ao carregar imagens:', error);
            galleryContainer.innerHTML = '<p class="error-message">Erro ao carregar imagens. Tente novamente mais tarde.</p>';
        }
    }

    // Renderizar a galeria
    function renderGallery(images) {
        galleryContainer.innerHTML = '';
        
        images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${image.image_url}" alt="${image.title}" 
                     loading="lazy" class="gallery-image">
                <div class="gallery-info">
                    <h3 class="image-title">${image.title}</h3>
                    <p class="image-description">${image.description || 'Sem descrição'}</p>
                    <small class="upload-date">
                        ${new Date(image.uploaded_at).toLocaleDateString('pt-BR')}
                    </small>
                </div>
            `;
            galleryContainer.appendChild(galleryItem);
        });
    }

    // Upload de imagem
    async function uploadImage(file, title, description) {
        try {
            // Validação básica
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
            }
            
            if (file.size > MAX_FILE_SIZE) {
                throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
            }

            // Upload para o storage
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Obter URL pública e salvar no banco
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName);

            const { error: insertError } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    title,
                    description,
                    image_url: publicUrl,
                    file_name: fileName,
                    uploaded_at: new Date().toISOString()
                }]);

            if (insertError) throw insertError;

            return true;
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    }

    // Preview da imagem selecionada
    function handleFilePreview(file) {
        if (!file) {
            resetPreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            if (previewPlaceholder) previewPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function resetPreview() {
        imagePreview.style.display = 'none';
        imagePreview.src = '#';
        if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    }

    function resetForm() {
        uploadForm.reset();
        resetPreview();
    }

    // ======================
    // EVENT LISTENERS
    // ======================

    // Controle do Modal
    openModalBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        passwordSection.style.display = 'block';
        uploadForm.classList.add('hidden');
        resetForm();
    });

    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Validação de senha
    confirmPasswordBtn.addEventListener('click', function() {
        if (modalPasswordInput.value === MODAL_PASSWORD) {
            passwordSection.style.display = 'none';
            uploadForm.classList.remove('hidden');
            modalPasswordInput.value = '';
        } else {
            alert('Senha incorreta!');
        }
    });

    // Preview da imagem
    imageInput.addEventListener('change', function(e) {
        handleFilePreview(e.target.files[0]);
    });

    // Envio do formulário
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const file = imageInput.files[0];
        const title = imageTitleInput.value.trim();
        const description = imageDescriptionInput.value.trim();

        // Desabilita o botão durante o upload
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            if (!file) throw new Error('Selecione uma imagem');
            if (!title) throw new Error('Informe um título');
            
            await uploadImage(file, title, description);
            
            alert('Imagem enviada com sucesso!');
            resetForm();
            await loadGalleryImages();
            modal.style.display = 'none';
        } catch (error) {
            alert(`Erro: ${error.message}`);
        } finally {
            // Reabilita o botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Imagem';
        }
    });

    // ======================
    // INICIALIZAÇÃO
    // ======================

    // Carrega a galeria quando a página é aberta
    loadGalleryImages();
});