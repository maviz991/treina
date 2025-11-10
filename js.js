<script>
document.addEventListener('DOMContentLoaded', function() {

    // ===================================================================
    // FUNÇÃO HELPER: Verifica se estamos na página principal do curso
    // ===================================================================
    function isCourseHomePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const sectionParam = urlParams.get('section');
        return !urlParams.has('section') || sectionParam === '0';
    }

    // ===================================================================
    // SETUP INICIAL DA PÁGINA (Executa uma vez no carregamento)
    // ===================================================================

    // --- 1. Injetar nome do usuário ---
    try {
        const userFullNameElement = document.querySelector('.loggedinas strong');
        if (userFullNameElement) {
            const fullName = userFullNameElement.textContent.trim();
            const firstName = fullName.split(' ')[0];
            document.querySelectorAll('.placeholder-firstname').forEach(el => {
                el.textContent = firstName;
            });
        }
    } catch (e) {
        console.error('Erro ao buscar nome de usuário:', e);
    }

    // --- 2. Marcar cards de atalho com cadeado ---
    document.querySelectorAll('.module-shortcut-card').forEach(card => {
        const sectionNumber = card.getAttribute('data-section-target');
        if (!sectionNumber) return;
        const moodleSection = document.querySelector(`#section-${sectionNumber}`) || document.querySelector(`.course-section-header[data-number='${sectionNumber}']`);
        if (moodleSection && moodleSection.querySelector('.icon.fa-lock')) {
            card.classList.add('locked');
        }
    });

    // --- 3. Configurar o botão contextual (Voltar ao topo / Início) ---
    document.querySelectorAll('.js-context-button-container').forEach(container => {
        const button = container.querySelector('a');
        if (!button) return;
        if (isCourseHomePage()) {
            button.textContent = button.dataset.toplevelText || "Voltar ao topo";
            button.href = button.dataset.toplevelHref || "#page-wrapper";
            button.classList.add('js-scroll-link');
        } else {
            button.textContent = button.dataset.sectionText || "Voltar para o Início do Curso";
            button.href = button.dataset.sectionHref || `/course/view.php?id=${new URLSearchParams(window.location.search).get('id')}`;
            button.classList.remove('js-scroll-link');
        }
        container.style.display = 'block';
    });

    // --- 4. Exibir elementos que só aparecem na página principal ---
    if (isCourseHomePage()) {
        document.querySelectorAll('.js-home-only').forEach(element => {
            element.style.display = ''; // Remove o 'display: none', deixando o CSS controlar
        });
    }

    // ===================================================================
    // INICIALIZAÇÃO DE COMPONENTES INTERATIVOS (Modal, Lupa)
    // ===================================================================

    // --- 1. Lógica para Modal de Imagem ---
    document.querySelectorAll('.image-modal-wrapper').forEach(wrapper => {
        const triggerImg = wrapper.querySelector('.modal-trigger-img');
        const modal = wrapper.querySelector('.image-modal-popup');
        if (triggerImg && modal) {
            const modalDisplayImg = modal.querySelector('.modal-display-img');
            const modalCaptionText = modal.querySelector('.modal-caption-text');
            const closeButton = modal.querySelector('.custom-close');

            triggerImg.addEventListener('click', function() {
                modal.style.display = "block";
                if (modalDisplayImg) modalDisplayImg.src = this.src;
                if (modalCaptionText) modalCaptionText.innerHTML = this.alt;
            });
            if (closeButton) {
                closeButton.addEventListener('click', () => modal.style.display = "none");
            }
            modal.addEventListener('click', (event) => {
                if (event.target === modal) modal.style.display = "none";
            });
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            document.querySelectorAll('.image-modal-popup[style*="display: block"]').forEach(m => m.style.display = "none");
        }
    });
    
    // --- 2. Lógica para Lupa (Magnify) ---
    function magnify(imgID, zoom) {
        var img = document.getElementById(imgID);
        if (!img) return;
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
    if (document.getElementById("myimage")) {
        magnify("myimage", 2);
    }

    // ===================================================================
    // OUVINTE DE CLIQUE ÚNICO E GLOBAL (APENAS PARA ROLAGEM SUAVE)
    // ===================================================================
    document.body.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        
        // Se o elemento clicado não for um link com a classe js-scroll-link, ignora.
        if (!link || !link.classList.contains('js-scroll-link')) {
            return;
        }

        // Se chegou aqui, é um link de rolagem. Impedimos o pulo padrão.
        e.preventDefault();
        
        const anchorTargetId = link.getAttribute('href');
        
        // Garante que o href seja uma âncora válida.
        if (anchorTargetId && anchorTargetId.startsWith('#')) {
            const anchorTarget = document.querySelector(anchorTargetId);
            
            if (anchorTarget) {
                // Rola suavemente até o alvo.
                anchorTarget.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    // ===================================================================
    // INÍCIO: LÓGICA PARA BARRAS DE PROGRESSO DE MÓDULO
    // ===================================================================
    document.querySelectorAll('.module-progress-container').forEach(progressContainer => {
        const sectionNumber = progressContainer.getAttribute('data-module-section');
        if (!sectionNumber) return;

        // Encontra a seção do Moodle correspondente
        const moodleSection = document.querySelector(`#section-${sectionNumber}`);
        if (!moodleSection) return;

        // Encontra todas as atividades com rastreamento de conclusão DENTRO daquela seção
        const activities = moodleSection.querySelectorAll('.activity-item[data-activityname]');
        
        // Encontra todas as atividades CONCLUÍDAS DENTRO daquela seção
        // O Moodle adiciona a classe .complete ou um ícone de check
        const completedActivities = moodleSection.querySelectorAll('.activity-item.complete, .activity-item .completion-check');

        const totalActivities = activities.length;
        const completedCount = completedActivities.length;

        let progressPercent = 0;
        if (totalActivities > 0) {
            progressPercent = Math.round((completedCount / totalActivities) * 100);
        }

        // Atualiza a barra de progresso e o texto
        const progressBarFill = progressContainer.querySelector('.module-progress-bar-fill');
        const progressText = progressContainer.querySelector('.progress-text');

        if (progressBarFill) {
            progressBarFill.style.width = progressPercent + '%';
        }
        if (progressText) {
            progressText.textContent = `${progressPercent}% concluído`;
        }
    });

}); // Fim do 'DOMContentLoaded'
</script>