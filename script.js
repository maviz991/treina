// ===================================================================
// SCRIPT PARA O CURSO GEOHAB (VERSÃO PARA TESTE LOCAL)
// ===================================================================

// $(function() { ... }) é a forma padrão do jQuery de executar o código
// assim que a página estiver totalmente carregada. Substitui o 'require' do Moodle.
$(function() {

    console.log("Página e jQuery prontos. Inicializando componentes...");

    // ===================================================================
    // INICIALIZAÇÃO DE COMPONENTES BOOTSTRAP (MODAL, TOOLTIP, POPOVER)
    // ===================================================================
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();
    // Modais são inicializados automaticamente via data-attributes, mas isso não prejudica.
    // $('.modal').modal(); 

    // Lógica para fechar o popover ao clicar fora
    $('body').on('click', function(e) {
        $('[data-toggle="popover"]').each(function() {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    // ===============================================================
    // PARTE 1: RASTREADOR DE NAVEGAÇÃO (NEUTRALIZADO PARA TESTE)
    // ===============================================================
    // AVISO: Esta parte depende de classes do Moodle, como 'course-X'.
    // Ela não vai quebrar o site, mas pode não funcionar como esperado localmente.
    try {
        const courseIdForResume = 1; // Simula um ID de curso para teste
        const storageKey = `moodle-last-activity-${courseIdForResume}`;

        function saveLastUrl(url) {
            if (!url || typeof url !== 'string') return;
            const isInvalidLink = ['update=', 'delete=', 'hide=', 'move.php', 'javascript:;'].some(term => url.includes(term));
            if (!isInvalidLink) {
                console.log(`(RASTREADOR) Salvando a URL: ${url}`);
                localStorage.setItem(storageKey, url);
            }
        }

        // ... a lógica de ouvinte de clique pode permanecer, ela não quebra se não encontrar os elementos ...

    } catch (e) {
        console.warn("A lógica do Rastreador de Navegação pode não funcionar totalmente em ambiente local.", e);
    }

    // ===============================================================
    // PARTE 2: EXIBIDOR DO BOTÃO "CONTINUAR" (NEUTRALIZADO PARA TESTE)
    // ===============================================================
    try {
        const resumeButton = document.getElementById('resume-course-button');
        if (resumeButton) {
            const courseIdForResume = 1;
            const storageKey = `moodle-last-activity-${courseIdForResume}`;
            const lastVisitedUrl = localStorage.getItem(storageKey);
            if (lastVisitedUrl) {
                resumeButton.href = lastVisitedUrl;
                resumeButton.style.display = 'inline-block';
                console.log("(EXIBIDOR) Botão 'Continuar' configurado para:", lastVisitedUrl);
            }
        }
    } catch (e) {
        console.warn("A lógica do Exibidor do Botão 'Continuar' pode não funcionar totalmente em ambiente local.", e);
    }


    // ===================================================================
    // INICIALIZAÇÃO DE COMPONENTES INTERATIVOS (Modal, Lupa, etc.)
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
    // (Sua função magnify e o restante do código JS que não depende do Moodle permanecem aqui)
    function magnify(imgID, zoom) {
        // ... sua função magnify completa ...
    }
    if (document.getElementById("myimage")) {
        magnify("myimage", 2);
    }


    // ===================================================================
    // OUVINTE DE CLIQUE ÚNICO E GLOBAL (ROLAGEM SUAVE)
    // ===================================================================
    document.body.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link || !link.classList.contains('js-scroll-link')) {
            return;
        }
        e.preventDefault();
        const anchorTargetId = link.getAttribute('href');
        if (anchorTargetId && anchorTargetId.startsWith('#')) {
            const anchorTarget = document.querySelector(anchorTargetId);
            if (anchorTarget) {
                anchorTarget.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    
// ===================================================================
// LÓGICA PARA ANIMAÇÃO DE TEXTO
// ===================================================================
const animatedTextElement = $('#animated-search-text');
    if (animatedTextElement.length) {
        const searchTerms = ["São Paulo", "PDHU", "zoneamento", "limite municipal"];
        let termIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeAnimation() {
            const currentTerm = searchTerms[termIndex];
            const typeDelay = isDeleting ? 75 : 150;

            if (isDeleting) {
                // Apagando...
                animatedTextElement.text(currentTerm.substring(0, charIndex - 1));
                charIndex--;
            } else {
                // Escrevendo...
                animatedTextElement.text(currentTerm.substring(0, charIndex + 1));
                charIndex++;
            }

            // Lógica de transição
            if (!isDeleting && charIndex === currentTerm.length) {
                // Terminou de escrever, pausa e começa a apagar
                setTimeout(() => { isDeleting = true; }, 2000);
            } else if (isDeleting && charIndex === 0) {
                // Terminou de apagar, vai para o próximo termo
                isDeleting = false;
                termIndex = (termIndex + 1) % searchTerms.length;
            }
            
            setTimeout(typeAnimation, typeDelay);
        }
        
        // Inicia a animação
        typeAnimation();
    }
// ===================================================================
// LÓGICA PARA LEGENDA INTERATIVA E HOTSPOTS
// ===================================================================
$('.step-content-layout-cols, .step-component').each(function() {
    const container = $(this);
    const legendItems = container.find('.legend-item');
    const hotspots = container.find('.hotspot');

    if (legendItems.length > 0 && hotspots.length > 0) {
        
        function activateItem(hotspotId) {
            // Remove a classe 'active' de todos
            legendItems.removeClass('active');
            hotspots.removeClass('active');

            // Adiciona a classe 'active' ao item e hotspot correspondentes
            container.find('.legend-item[data-hotspot="' + hotspotId + '"]').addClass('active');
            container.find('.hotspot[data-hotspot="' + hotspotId + '"]').addClass('active');
        }

        legendItems.on('click mouseenter', function() {
            const hotspotId = $(this).data('hotspot');
            activateItem(hotspotId);
        });

        hotspots.on('click mouseenter', function() {
            const hotspotId = $(this).data('hotspot');
            activateItem(hotspotId);
        });

        // Limpa a seleção quando o mouse sai da área de texto ou da mídia
        container.find('.step-content-col-text, .step-content-col-media, .step-content-media-hotspot').on('mouseleave', function() {
            legendItems.removeClass('active');
            hotspots.removeClass('active');
        });
    }
});
    // ===================================================================
    // LÓGICA DE PROGRESSO (NEUTRALIZADA, POIS DEPENDE DO MOODLE)
    // ===================================================================

// ===================================================================
// LÓGICA HÍBRIDA PARA IMAGEM INTERATIVA (COM ZOOM NO MOBILE)
// ===================================================================

function setupInteractiveImages() {
    const isDesktop = window.matchMedia('(min-width: 992px)').matches;

    $('.step-component').each(function() {
        const stepContainer = $(this);
        const hotspots = stepContainer.find('.hotspot');
        const legendItems = stepContainer.find('.legend-item');
        const image = stepContainer.find('.interactive-image-wrapper img'); // Seleciona a imagem

        if (hotspots.length === 0) return;

        // ===================================
        // LÓGICA PARA DESKTOP
        // ===================================
        if (isDesktop) {
            console.log("Modo Desktop: Ativando tooltips.");
            hotspots.tooltip({
                placement: 'left',
                boundary: 'viewport'
            });
        } 
        // ===================================
        // LÓGICA PARA MOBILE (COM ZOOM!)
        // ===================================
        else {
            console.log("Modo Mobile: Ativando legenda interativa com zoom.");
            if (legendItems.length === 0) return;

            function activateMobileItem(hotspotId, zoomData) {
                // Ativa o hotspot e item da legenda
                hotspots.removeClass('active');
                legendItems.removeClass('active');
                stepContainer.find('.hotspot[data-hotspot="' + hotspotId + '"]').addClass('active');
                stepContainer.find('.legend-item[data-hotspot="' + hotspotId + '"]').addClass('active');

                // LÓGICA DO ZOOM
                if (zoomData && image.length > 0) {
                    const [scale, posX, posY] = zoomData.split(',').map(Number);
                    
                    // Converte a posição percentual em um valor de translação
                    // O cálculo (posX - 50) * -1 move o ponto clicado para o centro da tela
                    const translateX = (posX - 50) * -1;
                    const translateY = (posY - 50) * -1;

                    image.css('transform', `scale(${scale}) translate(${translateX}%, ${translateY}%)`);
                }
            }
            
            function resetMobileView() {
                hotspots.removeClass('active');
                legendItems.removeClass('active');
                if (image.length > 0) {
                    image.css('transform', 'scale(1) translate(0, 0)');
                }
            }

            legendItems.on('click', function() {
                const hotspotId = $(this).data('hotspot');
                const zoomData = $(this).data('zoom');
                activateMobileItem(hotspotId, zoomData);

                // Rola o item clicado para o topo da lista rolavel
                const legendContainer = $(this).closest('.interactive-legend');
                if (legendContainer.length > 0) {
                    legendContainer.animate({
                        scrollTop: this.offsetTop - legendContainer.offset().top + legendContainer.scrollTop()
                    }, 300);
                }
            });

            // Reseta o zoom ao clicar fora
            $(document).on('click', function(event) {
                if (!$(event.target).closest('.step-component').length) {
                    resetMobileView();
                }
            });
        }
    });
}

// Executa a função principal quando a página carrega
setupInteractiveImages();

// Lógica de redimensionamento da janela
let resizeTimer;
$(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        location.reload(); 
    }, 250);
});
    // AVISO: A chamada ao Web Service e a contagem de conclusão do Moodle
    // vão falhar localmente. O código foi deixado aqui, mas comentado
    // ou dentro de 'try...catch' para não quebrar o resto do script.
    
    console.warn("A lógica de progresso do curso e dos módulos está desativada em ambiente local, pois depende de APIs e da estrutura do Moodle.");
    
});