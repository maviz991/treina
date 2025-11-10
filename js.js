<script>
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
    // INÍCIO: LÓGICA PARA CARDS DE ATALHO (SINALIZAÇÃO DE BLOQUEIO)
    // ===================================================================
    const shortcutCards = document.querySelectorAll('.module-shortcut-card');
    shortcutCards.forEach(card => {
        const sectionNumber = card.getAttribute('data-section-target');
        if (!sectionNumber) return;

        const moodleSection = document.querySelector(`#section-${sectionNumber}`) || document.querySelector(`.course-section-header[data-number='${sectionNumber}']`);
        if (moodleSection && moodleSection.querySelector('.icon.fa-lock')) {
            card.classList.add('locked');
        }
    });

    // ===================================================================
    // INÍCIO: LÓGICA DE CLIQUE PARA ABRIR SEÇÃO E ROLAR (PARA OS CARDS DE ATALHO)
    // ===================================================================
    const moduleShortcutLinks = document.querySelectorAll('.module-shortcut-card.js-module-link');
    moduleShortcutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const sectionNumber = this.getAttribute('data-section-target');
            if (sectionNumber) {
                const sectionTitleLink = document.querySelector(`#coursecontentsection${sectionNumber} a, .section[data-sectionid='${sectionNumber}'] a`);
                if (sectionTitleLink) {
                    sectionTitleLink.click(); // Abre a seção do Moodle
                }
            }

            const anchorTargetId = this.getAttribute('href');
            const anchorTarget = document.querySelector(anchorTargetId);
            if (anchorTarget) {
                setTimeout(() => {
                    anchorTarget.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });

    // ===================================================================
    // INÍCIO: LÓGICA DE CLIQUE APENAS PARA ROLAGEM SUAVE (OUTROS LINKS)
    // ===================================================================
    const simpleScrollLinks = document.querySelectorAll('.js-scroll-link:not(.js-module-link)');
    simpleScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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
    // INÍCIO: LÓGICA PARA BOTÃO CONTEXTUAL (Voltar ao Topo / Início)
    // ===================================================================
    document.querySelectorAll('.js-context-button-container').forEach(container => {
        const button = container.querySelector('a');
        if (!button) return; // Segurança

        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section'); // Pega o valor do parâmetro 'section'

        // CONDIÇÃO ATUALIZADA:
        // A página é considerada "principal" se:
        // 1. O parâmetro 'section' NÃO existe.
        // OU
        // 2. O parâmetro 'section' existe e é igual a '0'.
        if (!urlParams.has('section') || sectionParam === '0') {
            // ESTAMOS NA PÁGINA PRINCIPAL DO CURSO
            button.textContent = button.dataset.toplevelText || "Voltar ao topo";
            button.href = button.dataset.toplevelHref || "#page-wrapper";
            button.classList.add('js-scroll-link');
            button.classList.remove('js-module-link'); // Garante que a lógica de abrir seção não seja acionada
        } else {
            // ESTAMOS EM UMA PÁGINA DE SEÇÃO INTERNA (ex: section=1, section=2, etc.)
            button.textContent = button.dataset.sectionText || "Voltar para o Início do Curso";
            button.href = button.dataset.sectionHref || `/course/view.php?id=${urlParams.get('id')}`;
            button.classList.remove('js-scroll-link');
        }
        
        // Exibe o contêiner do botão após a lógica
        container.style.display = 'block'; 
    });

    // --- OUVINTE DE CLIQUE ÚNICO E INTELIGENTE ---
    document.body.addEventListener('click', function(e) {
        const link = e.target.closest('a');

        // Se não for um link com a classe js-scroll-link, não faz nada
        if (!link || !link.classList.contains('js-scroll-link')) {
            return;
        }

        // --- Chegamos aqui, então é um link de rolagem ---
        e.preventDefault(); // Impede o "pulo"

        // LÓGICA DE ROLAGEM SUAVE (para todos os js-scroll-link)
        const anchorTargetId = link.getAttribute('href');
        if (anchorTargetId && anchorTargetId.startsWith('#')) {
            const anchorTarget = document.querySelector(anchorTargetId);
            if (anchorTarget) {
                setTimeout(() => {
                    anchorTarget.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
        
    });
    


}); // Fim do 'DOMContentLoaded'
</script>