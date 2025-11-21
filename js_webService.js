

<script>
// ===================================================================
// SCRIPT FINAL E COMPLETO PARA O CURSO GEOHAB
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {

// ===============================================================
// SISTEMA DE "CONTINUAR ONDE PAROU" PARA MOODLE
// Usa User Preferences do Moodle para armazenar progresso
// ===============================================================

(function() {
    'use strict';

    // ===============================================================
    // PARTE 1: RASTREADOR DE LOCALIZAÇÃO (EXECUTA EM TODA PÁGINA)
    // ===============================================================
    function trackUserProgress() {
        try {
            const courseIdMatch = document.body.className.match(/course-(\d+)/);
            if (!courseIdMatch) {
                console.log("(RASTREADOR) Não é uma página de curso.");
                return;
            }

            const courseId = courseIdMatch[1];
            let sectionNumber = null;
            let cmId = null;

            // ESTRATÉGIA 1: Detectar Course Module ID (atividade específica)
            // Verifica se estamos em uma página de atividade (mod/xxx/view.php)
            const urlParams = new URLSearchParams(window.location.search);
            cmId = urlParams.get('id'); // ID do course module
            
            if (cmId) {
                console.log(`(RASTREADOR) Detectada atividade cmid=${cmId}`);
                
                // Buscar informações do módulo usando web service
                require(['core/ajax'], function(ajax) {
                    ajax.call([{
                        methodname: 'core_course_get_course_module',
                        args: { cmid: parseInt(cmId) },
                        done: function(response) {
                            if (response && response.cm) {
                                sectionNumber = response.cm.sectionnum;
                                console.log(`(RASTREADOR) Atividade está na seção ${sectionNumber}`);
                                saveProgress(courseId, sectionNumber, cmId);
                            }
                        },
                        fail: function(ex) {
                            console.warn("(RASTREADOR) Falha ao obter info do módulo:", ex);
                            // Fallback para outras estratégias
                            detectSectionFromPage(courseId);
                        }
                    }]);
                });
                return;
            }

            // ESTRATÉGIA 2: Detectar seção pela URL (course/view.php?section=X)
            sectionNumber = urlParams.get('section');
            if (sectionNumber && sectionNumber !== '0') {
                console.log(`(RASTREADOR) Seção detectada pela URL: ${sectionNumber}`);
                saveProgress(courseId, sectionNumber, null);
                return;
            }

            // ESTRATÉGIA 3: Detectar seção pelo breadcrumb ou hash
            const hash = window.location.hash;
            const sectionMatch = hash.match(/#section-(\d+)/);
            if (sectionMatch) {
                sectionNumber = sectionMatch[1];
                if (sectionNumber !== '0') {
                    console.log(`(RASTREADOR) Seção detectada pelo hash: ${sectionNumber}`);
                    saveProgress(courseId, sectionNumber, null);
                    return;
                }
            }

            // ESTRATÉGIA 4: Procurar no breadcrumb
            const breadcrumbLinks = document.querySelectorAll('.breadcrumb a, nav.breadcrumb a');
            for (let i = breadcrumbLinks.length - 1; i >= 0; i--) {
                const link = breadcrumbLinks[i];
                const linkParams = new URLSearchParams(link.search);
                if (linkParams.has('section')) {
                    sectionNumber = linkParams.get('section');
                    if (sectionNumber !== '0') {
                        console.log(`(RASTREADOR) Seção detectada pelo breadcrumb: ${sectionNumber}`);
                        saveProgress(courseId, sectionNumber, null);
                        return;
                    }
                }
            }

            console.log("(RASTREADOR) Página principal ou seção 0. Não salvando.");

        } catch (e) {
            console.error("(RASTREADOR) Erro:", e);
        }
    }

    // Função auxiliar para detectar seção diretamente do DOM
    function detectSectionFromPage(courseId) {
        const mainContent = document.querySelector('div[role="main"], #region-main');
        if (!mainContent) return;

        // Procurar por section-X no DOM
        const sectionContainer = mainContent.querySelector('[id^="section-"]');
        if (sectionContainer) {
            const sectionIdMatch = sectionContainer.id.match(/section-(\d+)/);
            if (sectionIdMatch) {
                const sectionNumber = sectionIdMatch[1];
                if (sectionNumber !== '0') {
                    console.log(`(RASTREADOR) Seção detectada pelo DOM: ${sectionNumber}`);
                    saveProgress(courseId, sectionNumber, null);
                }
            }
        }
    }

    // Salvar progresso usando User Preferences do Moodle
    function saveProgress(courseId, sectionNumber, cmId) {
        require(['core/ajax', 'core/notification'], function(ajax, notification) {
            const preferences = [
                {
                    name: `course_${courseId}_last_section`,
                    value: sectionNumber.toString()
                }
            ];

            if (cmId) {
                preferences.push({
                    name: `course_${courseId}_last_cmid`,
                    value: cmId.toString()
                });
            }

            ajax.call([{
                methodname: 'core_user_set_user_preferences',
                args: { preferences: preferences },
                done: function() {
                    console.log(`✓ (RASTREADOR) Progresso salvo: Seção ${sectionNumber}` + 
                               (cmId ? `, Atividade ${cmId}` : ''));
                },
                fail: function(ex) {
                    console.error("✗ (RASTREADOR) Falha ao salvar:", ex);
                    notification.exception(ex);
                }
            }]);
        });
    }

    // ===============================================================
    // PARTE 2: EXIBIDOR DO BOTÃO "CONTINUAR"
    // ===============================================================
    function setupContinueButton() {
        const resumeButton = document.getElementById('resume-course-button');
        if (!resumeButton) {
            console.log("(EXIBIDOR) Botão #resume-course-button não encontrado.");
            return;
        }

        const courseIdMatch = document.body.className.match(/course-(\d+)/);
        if (!courseIdMatch) return;

        const courseId = courseIdMatch[1];

        require(['core/ajax', 'core/notification'], function(ajax, notification) {
            // Buscar preferências do usuário
            ajax.call([{
                methodname: 'core_user_get_user_preferences',
                args: {
                    name: `course_${courseId}_last_section`
                },
                done: function(response) {
                    if (response && response.preferences && response.preferences.length > 0) {
                        const lastSection = response.preferences[0].value;
                        
                        if (lastSection && lastSection !== '0') {
                            // Verificar se também temos cmid salvo
                            ajax.call([{
                                methodname: 'core_user_get_user_preferences',
                                args: { name: `course_${courseId}_last_cmid` },
                                done: function(cmResponse) {
                                    let targetUrl;
                                    
                                    if (cmResponse && cmResponse.preferences && cmResponse.preferences.length > 0) {
                                        const lastCmId = cmResponse.preferences[0].value;
                                        targetUrl = `/mod/view.php?id=${lastCmId}`;
                                        console.log(`(EXIBIDOR) Redirecionando para atividade ${lastCmId}`);
                                    } else {
                                        targetUrl = `/course/view.php?id=${courseId}&section=${lastSection}`;
                                        console.log(`(EXIBIDOR) Redirecionando para seção ${lastSection}`);
                                    }
                                    
                                    resumeButton.href = targetUrl;
                                    resumeButton.style.display = 'inline-block';
                                    resumeButton.classList.add('btn', 'btn-primary');
                                }
                            }]);
                        } else {
                            resumeButton.style.display = 'none';
                            console.log("(EXIBIDOR) Sem progresso para exibir.");
                        }
                    } else {
                        resumeButton.style.display = 'none';
                        console.log("(EXIBIDOR) Nenhuma preferência encontrada.");
                    }
                },
                fail: function(ex) {
                    console.error("(EXIBIDOR) Erro ao buscar preferências:", ex);
                    resumeButton.style.display = 'none';
                }
            }]);
        });
    }

    // ===============================================================
    // INICIALIZAÇÃO
    // ===============================================================
    
    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            trackUserProgress();
            setupContinueButton();
        });
    } else {
        trackUserProgress();
        setupContinueButton();
    }

})();

// ===================================================================
// INÍCIO: LÓGGICA DE INICIALIZAÇÃO DE COMPONENTES BOOTSTRAP (jQuery + Bootstrap)
// ===================================================================

// Pede ao Moodle para carregar o jQuery E o JavaScript do Bootstrap
try {
    require(['jquery', 'core/popper', 'core/bootstrap'], function($) {
        console.log("jQuery e Bootstrap foram carregados. Inicializando popovers...");
        $('[data-toggle="popover"]').popover();
        $('body').on('click', function (e) {
            $('[data-toggle="popover"]').each(function () {
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
    }, function(err) {
        console.warn("Módulo 'core/bootstrap' não pôde ser carregado. Popovers podem não funcionar. Erro:", err.message);
    });
} catch(e) {
    console.error("Erro geral na inicialização do Bootstrap:", e);
}

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
    // INÍCIO: LÓGICA PARA BARRA DE PROGRESSO (VIA WEB SERVICE EDWISER)
    // ===================================================================

    const progressContainer = document.querySelector('.course-progress-container');
    const courseProgressFill = document.getElementById('course-progress-fill');
    const courseProgressText = document.getElementById('course-progress-text');

    if (progressContainer && courseProgressFill && courseProgressText) {
        const courseId = progressContainer.getAttribute('data-courseid');

        if (courseId) {
            // Usa a API 'require' do Moodle para carregar o módulo AJAX
            require(['core/ajax'], function(ajax) {
                
                // Faz a chamada para o Web Service do formato Edwiser
                const ajaxRequest = ajax.call([{
                    methodname: 'format_remuiformat_course_progress_data',
                    args: { courseid: courseId },
                    done: function(response) {
                        // --- SUCESSO! ---
                        const percentage = response.percentage || 0;
                        
                        console.log(`Progresso recebido do Web Service: ${percentage}%`);

                        // Atualiza a barra e o texto com os dados recebidos
                        courseProgressFill.style.width = percentage + '%';
                        courseProgressText.textContent = `${percentage}% concluído`;
                    },
                    fail: function(ex) {
                        // --- FALHA! ---
                        console.error("Falha ao chamar o Web Service de progresso:", ex);
                        courseProgressText.textContent = "Erro ao carregar progresso.";
                    }
                }]);
            });
        } else {
            console.error("Não foi possível encontrar o 'data-courseid' no contêiner da barra de progresso.");
        }
    }

// ===================================================================
// INÍCIO: LÓGICA PARA BARRAS DE PROGRESSO DE MÓDULO (VERSÃO FINAL)
// ===================================================================

// [CORREÇÃO] O seletor agora procura pela classe unificada E pelo data-attribute
document.querySelectorAll('.course-progress-container[data-module-section]').forEach(progressContainer => {
    const sectionNumber = progressContainer.getAttribute('data-module-section');
    if (!sectionNumber) return;

    const moodleSection = document.querySelector(`#section-${sectionNumber}`);
    if (!moodleSection) return;

    // CONTAGEM TOTAL: Encontra todas as atividades rastreáveis na seção.
    const activitiesInSection = moodleSection.querySelectorAll('.activity .activity-completion');
    const totalActivities = activitiesInSection.length;

    // CONTAGEM DE CONCLUÍDAS:
    // Procura por atividades que contenham um botão com a classe 'btn-success' dentro da área de conclusão.
    const completedInSection = moodleSection.querySelectorAll('.activity .activity-completion .btn-success');
    const completedCount = completedInSection.length;

    let progressPercent = 0;
    if (totalActivities > 0) {
        progressPercent = Math.round((completedCount / totalActivities) * 100);
    }
    
    // Log final para confirmar
    console.log(`Progresso Módulo ${sectionNumber}: ${completedCount} de ${totalActivities} concluídas = ${progressPercent}%`);

    // Atualiza a barra de progresso e o texto
    const progressBarFill = progressContainer.querySelector('.course-progress-bar-fill');
    const progressText = progressContainer.querySelector('.progress-text');

    if (progressBarFill) progressBarFill.style.width = progressPercent + '%';
    if (progressText) progressText.textContent = `${progressPercent}% concluído`;
});
// ===================================================================
// FIM: LÓGICA PARA BARRAS DE PROGRESSO DE MÓDULO
// ===================================================================

});
</script>