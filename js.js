// Um único "ouvinte" para garantir que todo o nosso código rode depois que a página carregar
document.addEventListener('DOMContentLoaded', function() {

    // ===================================================================
    // INÍCIO: LÓGICA PARA MODAL DE IMAGEM
    // ===================================================================
    const modalWrappers = document.querySelectorAll('.image-modal-wrapper');
    modalWrappers.forEach(function(wrapper) {
        const triggerImg = wrapper.querySelector('.modal-trigger-img');
        const modal = wrapper.querySelector('.image-modal-popup');
        if (triggerImg && modal) { // Verificação de segurança
            const modalDisplayImg = modal.querySelector('.modal-display-img');
            const modalCaptionText = modal.querySelector('.modal-caption-text');
            const closeButton = modal.querySelector('.custom-close');

            triggerImg.addEventListener('click', function() {
                modal.style.display = "block";
                if(modalDisplayImg) modalDisplayImg.src = this.src;
                if(modalCaptionText) modalCaptionText.innerHTML = this.alt;
            });
            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    modal.style.display = "none";
                });
            }
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            });
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.image-modal-popup').forEach(function(openModal) {
                if (openModal.style.display === "block") {
                    openModal.style.display = "none";
                }
            });
        }
    });
    // ===================================================================
    // FIM: LÓGICA PARA MODAL DE IMAGEM
    // ===================================================================


    // ===================================================================
    // INÍCIO: LÓGICA PARA LUPA (MAGNIFY)
    // ===================================================================
    function magnify(imgID, zoom) {
        var img = document.getElementById(imgID);
        if (!img) return; // Verificação de segurança para evitar erros

        var glass, w, h, bw;
        glass = document.createElement("DIV");
        glass.setAttribute("class", "img-magnifier-glass");
        img.parentElement.insertBefore(glass, img);
        glass.style.backgroundImage = "url('" + img.src + "')";
        glass.style.backgroundRepeat = "no-repeat";
        glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
        bw = 3;
        w = glass.offsetWidth / 2;
        h = glass.offsetHeight / 2;
        
        function moveMagnifier(e) {
            e.preventDefault();
            var pos = getCursorPos(e), x = pos.x, y = pos.y;
            if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
            if (x < w / zoom) { x = w / zoom; }
            if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
            if (y < h / zoom) { y = h / zoom; }
            glass.style.left = (x - w) + "px";
            glass.style.top = (y - h) + "px";
            glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
        }

        function getCursorPos(e) {
            var a = img.getBoundingClientRect(), x = 0, y = 0;
            e = e || window.event;
            x = (e.pageX || e.touches[0].pageX) - a.left - window.pageXOffset;
            y = (e.pageY || e.touches[0].pageY) - a.top - window.pageYOffset;
            return { x: x, y: y };
        }
        
        glass.addEventListener("mousemove", moveMagnifier);
        img.addEventListener("mousemove", moveMagnifier);
        glass.addEventListener("touchmove", moveMagnifier);
        img.addEventListener("touchmove", moveMagnifier);
    }
    // Inicia a lupa apenas se a imagem existir
    if (document.getElementById("myimage")) {
        magnify("myimage", 2);
    }
    // ===================================================================
    // FIM: LÓGICA PARA LUPA (MAGNIFY)
    // ===================================================================


    // ===================================================================
    // INÍCIO: LÓGICA PARA INJETAR NOME DO USUÁRIO
    // ===================================================================
    try {
        const userFullNameElement = document.querySelector('.loggedinas strong');
        if (userFullNameElement) {
            const fullName = userFullNameElement.textContent.trim();
            const firstName = fullName.split(' ')[0];
            const placeholders = document.querySelectorAll('.placeholder-firstname');
            placeholders.forEach(el => {
                el.textContent = firstName;
            });
        }
    } catch (e) {
        console.error('Erro ao buscar nome de usuário:', e);
    }
    // ===================================================================
    // FIM: LÓGICA PARA INJETAR NOME DO USUÁRIO
    // ===================================================================


 // ===================================================================
// INÍCIO: LÓGICA PARA CARDS DE ATALHO (SINALIZAÇÃO E CLIQUE)
// ===================================================================

// --- LÓGICA PARA VERIFICAR E MARCAR OS CARDS COM CADEADO ---
const shortcutCards = document.querySelectorAll('.module-shortcut-card');
shortcutCards.forEach(card => {
    const sectionNumber = card.getAttribute('data-section-target');
    if (!sectionNumber) return;

    // Tenta encontrar a seção
    const moodleSection = document.querySelector(`#section-${sectionNumber}`) || document.querySelector(`.course-section-header[data-number='${sectionNumber}']`);
    
    if (moodleSection) {
        const lockIcon = moodleSection.querySelector('.icon.fa-lock');
        if (lockIcon) {
            card.classList.add('locked'); // Apenas adiciona a classe para o CSS mostrar o cadeado
        }
    }
});

// --- LÓGICA DE CLIQUE E ROLAGEM SUAVE (APLICADA A TODOS OS CARDS) ---
const allModuleLinks = document.querySelectorAll('.js-module-link');

allModuleLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        // NÃO HÁ MAIS BLOQUEIO AQUI
        e.preventDefault(); 

        const anchorTargetId = this.getAttribute('href');
        const anchorTarget = document.querySelector(anchorTargetId);

        if (anchorTarget) {
            anchorTarget.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
// ===================================================================
// FIM: LÓGICA PARA CARDS DE ATALHO
// ===================================================================

}); // Fim do 'DOMContentLoaded'
