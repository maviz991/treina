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
// LÓGICA PARA LEGENDA INTERATIVA E HOTSPOTS (MODIFICADA PARA NÃO CONFLITAR COM ZOOM)
// ===================================================================
$('.step-content-layout-cols').each(function() {
    // Apenas para componentes que não são de imagem interativa com zoom
    const container = $(this);
    if (container.find('.interactive-image-wrapper').length > 0) {
        // Se for um componente de imagem interativa, não aplica esta lógica
        // pois ela será tratada pela função setupInteractiveImages()
        return;
    }
    
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
// LÓGICA PARA IMAGEM INTERATIVA COM ZOOM (MOBILE E DESKTOP) - MODIFICADO
// ===================================================================
function setupInteractiveImages() {
    if (typeof jQuery === 'undefined') {
        console.log("jQuery não disponível ainda para imagens");
        return;
    }
    
    const $ = jQuery;
    const isDesktop = window.matchMedia('(min-width: 992px)').matches;

    $('.step-component').each(function() {
        const stepContainer = $(this);
        const imageWrapper = stepContainer.find('.interactive-image-wrapper');
        const innerContainer = imageWrapper.find('.interactive-image-inner-container');

        const image = innerContainer.find('img');
        const hotspots = innerContainer.find('.hotspot'); // Hotspots estão no innerContainer
        const legendItems = stepContainer.find('.interactive-legend .legend-item');
        // FIM NOVO

        if (hotspots.length === 0) return;
        
        // ... (console.log) ...

        // Limpa eventos anteriores
        if ($.fn.tooltip) {
            hotspots.tooltip('dispose'); // Mantemos o dispose para limpeza
        }
        hotspots.off('.interactive');
        hotspots.off('.desktop'); // Adiciona um namespace para desktop
        legendItems.off('.interactive');
        
        // IMPORTANTE: Limpa também os estados ativos ao reinicializar
        hotspots.removeClass('active');
        legendItems.removeClass('active');

        // ===================================
        // FUNÇÕES GLOBAIS DE ZOOM (Reutilizadas)
        // ===================================
        function activateZoom(hotspotId, zoomData) {
            console.log("DEBUG: activateZoom chamado para hotspotId:", hotspotId, "com zoomData:", zoomData);
            
            hotspots.removeClass('active');
            legendItems.removeClass('active');
            stepContainer.find('.hotspot[data-hotspot="' + hotspotId + '"]').addClass('active');
            stepContainer.find('.legend-item[data-hotspot="' + hotspotId + '"]').addClass('active');

            if (zoomData && image.length > 0) {
                const parts = zoomData.split(',');
                const scale = parseFloat(parts[0]);
                const posX = parseFloat(parts[1]);
                const posY = parseFloat(parts[2]);
                
                const translateX = (posX - 50) * -1;
                const translateY = (posY - 50) * -1;
                
                const transformValue = 'scale(' + scale + ') translate(' + translateX + '%, ' + translateY + '%)';
                
                console.log("DEBUG: Aplicando transform:", transformValue);
                
                // Remover temporariamente os eventos de clique fora para evitar conflitos
                $(document).off('click.resetZoomDesktop');
                $(document).off('click.resetZoomMobile');
                
                innerContainer[0].style.transform = transformValue;
                innerContainer[0].style.transition = 'transform 0.5s ease'; // Aumentado para melhor visualização
                
                image[0].style.transform = 'none';
                image[0].style.transition = 'none';

                hotspots.each(function() {
                    this.style.transform = 'translate(-50%, -50%)';
                    this.style.transition = 'all 0.5s ease';
                });

                // NOVO: Scroll suave para o wrapper para centralizar a área visível após o zoom
                $('html, body').animate({
                    scrollTop: imageWrapper.offset().top - 50 // Ajuste 50px de margem superior
                }, 300);
                
                // Reativar os eventos de clique fora após um pequeno delay
                setTimeout(function() {
                    if (isDesktop) {
                        $(document).on('click.resetZoomDesktop', function(event) {
                            const $target = $(event.target);
                            if (!$target.closest('.step-component').length &&
                                !$target.closest('.tooltip').length) {
                                console.log("DEBUG: Clique fora detectado em desktop, resetando visualização");
                                resetView();
                            }
                        });
                    } else {
                        $(document).on('click.resetZoomMobile', function(event) {
                            const $target = $(event.target);
                            if (!$target.closest('.step-component').length &&
                                !$target.closest('.interactive-legend').length) {
                                console.log("DEBUG: Clique fora detectado em mobile, resetando visualização");
                                resetView();
                            }
                        });
                    }
                }, 600); // Tempo um pouco maior que a transição para garantir que o zoom seja aplicado primeiro
            }
        }
        
        function resetView() {
            console.log("DEBUG: resetView() chamado");
            
            hotspots.removeClass('active');
            legendItems.removeClass('active');

            if (innerContainer.length > 0){
                innerContainer[0].style.transform = 'scale(1) translate(0, 0)';
                innerContainer[0].style.transition = 'transform 0.5s ease';
            }
            
            if (image.length > 0) {
                image[0].style.transform = 'none';
                image[0].style.transition = 'none';
            }
            
            hotspots.each(function() {
                this.style.transform = 'translate(-50%, -50%)';
            });
        }
        // ===================================
        // FIM FUNÇÕES GLOBAIS DE ZOOM
        // ===================================


        // ===================================
        // LÓGICA PARA DESKTOP
        // ===================================
        if (isDesktop) {
            console.log("→ Modo Desktop: Ativando Tooltip no Hover e Zoom no Clique");
            
            // 1. Inicializar Tooltips do Bootstrap (No Hover)
            if ($.fn.tooltip) {
                hotspots.each(function() {
                    $(this).tooltip({
                        placement: 'auto', // Mudança para 'auto' para melhor posicionamento
                        boundary: 'viewport',
                        trigger: 'hover' // Ativa no hover, desativa ao sair
                    });
                });
            }
            
            // 2. Adiciona o listener de clique (Para o Zoom)
            hotspots.on('click.desktop', function(e) {
                console.log("DEBUG: Clique no hotspot em desktop detectado");
                e.preventDefault();
                e.stopPropagation();

                const $this = $(this);
                const hotspotId = $this.data('hotspot');
                const isActive = $this.hasClass('active'); // NOVO: Verifica se já está ativo

                console.log("DEBUG: hotspotId:", hotspotId, "isActive:", isActive);

                // 1. Se já estiver ativo, reseta e sai.
                if (isActive) {
                    console.log("DEBUG: Hotspot já está ativo, resetando visualização");
                    resetView();
                    return;
                }

                // Fecha qualquer tooltip aberto no clique
                if ($.fn.tooltip) {
                    $this.tooltip('hide');
                }
                
                // 2. Se não estiver ativo, aplica o zoom
                const zoomData = stepContainer.find('.interactive-legend .legend-item[data-hotspot="' + hotspotId + '"]').data('zoom');
                console.log("DEBUG: zoomData encontrado:", zoomData);
                activateZoom(hotspotId, zoomData);
                });
            
        } 
        // ===================================
        // LÓGICA PARA MOBILE (COM ZOOM!)
        // ===================================
        else {
            console.log("→ Modo Mobile: Ativando legenda com zoom");
            
            if (legendItems.length === 0) {
                console.warn("⚠️ Nenhum item de legenda encontrado");
                return;
            }

            // FUNÇÃO PARA MOBILE (Usa a função global activateZoom)
            legendItems.on('click.interactive', function(e) {
                console.log("DEBUG: Clique no item de legenda em mobile detectado");
                e.preventDefault();
                e.stopPropagation();
                
                const $this = $(this);
                const hotspotId = $this.data('hotspot');
                const zoomData = $this.data('zoom');
                const isActive = $this.hasClass('active');

                console.log("DEBUG: hotspotId:", hotspotId, "isActive:", isActive, "zoomData:", zoomData);

                // 1. Se já estiver ativo, reseta e sai.
                if (isActive) {
                    console.log("DEBUG: Item de legenda já está ativo, resetando visualização");
                    resetView();
                    // REMOVIDO: Scroll para o topo para evitar salto indesejado
                    // const legendContainer = this.closest('.interactive-legend');
                    // if (legendContainer) {
                    //     legendContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // }
                    return;
                }

                // 2. Se não estiver ativo, aplica o zoom
                activateZoom(hotspotId, zoomData);

                // Scroll suave
                const legendContainer = this.closest('.interactive-legend');
                if (legendContainer) {
                    this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            // HOVER nos itens (feedback visual) - Mantido no mobile
            legendItems.on('mouseenter.interactive', function() {
                const hotspotId = $(this).data('hotspot');
                stepContainer.find('.hotspot[data-hotspot="' + hotspotId + '"]').addClass('hover');
            });

            legendItems.on('mouseleave.interactive', function() {
                hotspots.removeClass('hover');
            });

            // Reset ao clicar fora (Usa a função global resetView)
            $(document).off('click.resetZoomMobile').on('click.resetZoomMobile', function(event) {
                const $target = $(event.target);
                if (!$target.closest('.step-component').length && 
                    !$target.closest('.interactive-legend').length) {
                    resetView();
                }
            });
            
            console.log("✅ Mobile configurado:", legendItems.length, "itens");
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