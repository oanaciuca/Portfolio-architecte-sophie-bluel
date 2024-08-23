document.addEventListener('DOMContentLoaded', () => {
    const modalGallery = document.getElementById('modal-gallery');
    const modalForm = document.getElementById('modal-form');
    const openModalButton = document.getElementById('open-modal');
    const addPhotoButton = document.getElementById('add-photo');
    const closeModalButtons = document.querySelectorAll('.modal .close');
    const ajoutPhotoForm = document.getElementById('ajout-photo-form');
    const errorMessage = document.getElementById('error-message');
    const galleryContainer = document.getElementById('gallery-container');
    const mainGallery = document.querySelector('.gallery');
    const btnBack = document.querySelector('.btn-back');
    const fileInput = document.getElementById('image');
    const plusAjoutContainer = document.querySelector('.plus-ajout-container'); // Conteneur du bouton Ajouter photo
    const iconContainer = document.querySelector('.icon'); // Conteneur de l'icône
    const submitButton = document.querySelector('.btn-add-work');

    const openModal = (modal) => {
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        document.querySelectorAll('.modal.visible').forEach(modal => {
            modal.classList.remove('visible');
            modal.setAttribute('aria-hidden', 'true');
        });
        document.body.style.overflow = '';
    };

    openModalButton.addEventListener('click', () => openModal(modalGallery));
    addPhotoButton.addEventListener('click', () => {
        closeModal();
        openModal(modalForm);
    });
    btnBack.addEventListener('click', () => {
        closeModal();
        openModal(modalGallery);
    });

    closeModalButtons.forEach(button => button.addEventListener('click', closeModal));

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });

    const loadGallery = async () => {
        try {
            const response = await fetch('http://localhost:5678/api/works');
            const works = await response.json();
            galleryContainer.innerHTML = '';
            mainGallery.innerHTML = '';

            works.forEach(work => createGalleryItem(work, galleryContainer, true, false));
            works.forEach(work => createGalleryItem(work, mainGallery, false, true));
        } catch (error) {
            console.error('Erreur lors de la récupération des travaux:', error);
            window.alert('Erreur lors de la récupération des travaux');
        }
    };

    const createGalleryItem = (work, container, includeDelete, includeTitle) => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');

        img.src = work.imageUrl;
        img.alt = work.title;

        figure.appendChild(img);

        if (includeTitle) {
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = work.title;
            figure.appendChild(figcaption);
        }

        if (includeDelete) {
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fa-solid', 'fa-trash-can', 'delete-icon');
            deleteIcon.addEventListener('click', () => deletePhoto(work.id));
            figure.appendChild(deleteIcon);
        }

        container.appendChild(figure);
    };

    const deletePhoto = (photoId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token d\'authentification non trouvé');
            window.alert('Token d\'authentification non trouvé');
            return;
        }

        fetch(`http://localhost:5678/api/works/${photoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.ok) {
                loadGallery(); // reloading
            } else {
                return response.json().then(json => {
                    console.error('Erreur lors de la suppression de la photo:', json);
                    throw new Error(`Erreur: ${response.status} - ${JSON.stringify(json)}`);
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de la photo:', error);
            window.alert('Erreur lors de la suppression de la photo');
        });
    };

    function checkFormInputs() {
        const title = document.getElementById("title").value.trim();
        const category = document.getElementById("category").value;
        const fileInputFiles = fileInput.files;
    
        if (title && category !== "0" && fileInputFiles.length > 0) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'disabled');
        }
    }
    
    document.getElementById("title").addEventListener('input', checkFormInputs);
    document.getElementById("category").addEventListener('change', checkFormInputs);
    fileInput.addEventListener('change', checkFormInputs);
    
    checkFormInputs();

    const submitForm = (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            window.alert('Token d\'authentification non trouvé');
            return;
        }

        const formData = new FormData(ajoutPhotoForm);

        fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => Promise.reject(text));
            }
        })
        .then(() => {
            closeModal();
            loadGallery();
        })
        .catch(error => {
            errorMessage.textContent = "Erreur lors de l'ajout de la photo.";
            errorMessage.style.display = "block";
            console.error('Erreur lors de l\'ajout de la photo:', error);
            window.alert('Erreur lors de l\'ajout de la photo');
        });
    };

    const previewImage = () => {
        // Step 1: récupération du fichier
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            // Step 2: Construction de l'objet image
            const previewImg = document.createElement('img');
            previewImg.src = reader.result;
            previewImg.alt = 'Aperçu de l\'image';

            // Style de l'image
            previewImg.style.display = 'block';
            previewImg.style.maxWidth = '100%';  
            previewImg.style.maxHeight = '193px';
            previewImg.style.margin = '0 auto'; 
            previewImg.style.objectFit = 'contain'; 

            // Step 3: insertion de l'image vers le container Parent
            const previewContainer = document.getElementById('image-preview-container');
            previewContainer.innerHTML = '';
            previewContainer.appendChild(previewImg);

            // Cacher les éléments après la sélection de la photo
            plusAjoutContainer.style.display = 'none';
            iconContainer.style.display = 'none';
            const jpgElement = document.querySelector('.jpg');
            if (jpgElement) {
                jpgElement.style.display = 'none';
            }
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    fileInput.addEventListener('change', () => {
        previewImage();
        //submitButton.disabled = false;
    });

    ajoutPhotoForm.addEventListener('submit', submitForm);

    loadGallery();

});