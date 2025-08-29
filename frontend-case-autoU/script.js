document.addEventListener('DOMContentLoaded', () => {
    // Seleção dos principais elementos da interface
    const uploadBox = document.getElementById('uploadBox'); // Área de upload (drag & drop)
    const fileUpload = document.getElementById('fileUpload'); // Input de arquivo
    const fileNameDisplay = document.getElementById('fileNameDisplay'); // Exibição do nome do arquivo
    const btnAnalisar = document.getElementById('btnAnalisar'); // Botão para iniciar análise
    const txtEmail = document.getElementById('txtEmail'); // Campo de texto para e-mail
    const boxAnaliseResultados = document.getElementById('boxAnaliseResultados'); // Área de exibição dos resultados

        // Animação inicial da página usando GSAP e inicialização dos ícones Lucide
        lucide.createIcons(); // Renderiza ícones SVG
        gsap.set(['header', '.boxPrincipal'], { autoAlpha: 0 }); // Esconde header e box principal
        const tl = gsap.timeline();
        tl.to("header", { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" })
            .to(".boxPrincipal", { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");

    // Função para atualizar o nome do arquivo exibido
    function atualizarNomeArquivo(input) {
        if (input.files.length > 0) {
            fileNameDisplay.textContent = input.files[0].name;
        } else {
            fileNameDisplay.textContent = 'Nenhum arquivo selecionado.';
        }
    }

    // Configuração do upload de arquivo (drag & drop e clique)
    if (uploadBox) {
        // Clique na área de upload abre o seletor de arquivos
        uploadBox.addEventListener('click', () => fileUpload.click());
        // Atualiza nome ao selecionar arquivo manualmente
        uploadBox.addEventListener('change', () => atualizarNomeArquivo(fileUpload));
        // Efeito visual ao arrastar arquivo sobre a área
        uploadBox.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadBox.classList.add('dragover');
        });
        // Remove efeito visual ao sair
        uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
        // Ao soltar arquivo, atualiza input e nome
        uploadBox.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadBox.classList.remove('dragover');
            if (event.dataTransfer.files.length > 0) {
                fileUpload.files = event.dataTransfer.files;
                atualizarNomeArquivo(fileUpload);
            }
        });
    }

    // Sincronização dos inputs: impede envio de texto e arquivo ao mesmo tempo
    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length > 0) txtEmail.value = '';
    });
    txtEmail.addEventListener('input', () => {
        if (txtEmail.value.trim() !== '' && fileUpload.files.length > 0) {
            fileUpload.value = null;
            atualizarNomeArquivo(fileUpload);
        }
    });

    // HTML exibido durante o processamento da análise
    const loadingHTML = `
        <div class="analise-loading">
            <span class="loading-spinner"></span>
            <h4>Analisando<span>...</span></h4>
        </div>
    `;

    // Função que gera o HTML dos resultados da análise recebidos da API
    const createResultadosHTML = (dados) => {
        const tagClass = dados.classificacao.toLowerCase().includes('improdutivo') ? 'improdutivo' : 'produtivo';
        return `
            <div class="resultados-container">
                <div class="resultados-header">
                    <div class="classificacao-tag ${tagClass}">
                        <i data-lucide="info"></i>
                        <span>${dados.classificacao}</span>
                    </div>
                </div>
                <div class="resultados-analise-section">
                    <h5 class="coluna-titulo"><i data-lucide="lightbulb"></i> Análise do Algoritmo</h5>
                    <p>${dados.analise}</p>
                </div>
                <div class="resultados-resposta-section">
                    <h5 class="coluna-titulo"><i data-lucide="message-square" style="color: #F5551C; stroke-width: 2"></i> Resposta Sugerida</h5>
                    <div class="resposta-header">
                        <span><i data-lucide="history"></i>Resposta gerada automaticamente</span>
                        <button id="btnCopiar" class="btn-copiar"><i data-lucide="clipboard"></i> Copiar</button>
                    </div>
                    <textarea id="respostaTexto" class="resposta-textarea" readonly>${dados.resposta}</textarea>
                </div>
            </div>
        `;
    };

    // Animação de entrada dos resultados usando GSAP
    function animarResultados() {
        const elementos = document.querySelectorAll('.resultados-container > *');
        gsap.from(elementos, {
            duration: 0.6,
            y: 30,
            autoAlpha: 0,
            stagger: 0.15,
            ease: "power2.out"
        });
    }

    // Ativa funcionalidade do botão de copiar resposta sugerida para área de transferência
    function ativarBotaoCopiar() {
        const btnCopiar = document.getElementById('btnCopiar');
        if (btnCopiar) {
            btnCopiar.addEventListener('click', () => {
                const textoResposta = document.getElementById('respostaTexto').value;
                navigator.clipboard.writeText(textoResposta).then(() => {
                    const textoOriginal = btnCopiar.innerHTML;
                    btnCopiar.innerHTML = `<i data-lucide="check"></i> Copiado!`;
                    lucide.createIcons();
                    setTimeout(() => {
                        btnCopiar.innerHTML = textoOriginal;
                        lucide.createIcons();
                    }, 2000);
                });
            });
        }
    }

    // Evento do botão "Analisar": envia dados para API, exibe loading, mostra resultados ou erro
    if (btnAnalisar) {
        btnAnalisar.addEventListener('click', () => {
            const temTexto = txtEmail.value.trim() !== '';
            const temArquivo = fileUpload.files.length > 0;

            if (temTexto || temArquivo) {
                // Anima e mostra loading
                gsap.to(".boxPrincipal", { duration: 0.5, autoAlpha: 0.5, scale: 0.98, ease: "power2.in" });
                boxAnaliseResultados.innerHTML = loadingHTML;
                boxAnaliseResultados.classList.remove('hidden');
                gsap.from(boxAnaliseResultados, { duration: 0.5, y: 50, autoAlpha: 0, ease: "power2.out", delay: 0.2 });

                // Monta dados do formulário
                const formData = new FormData();
                formData.append('texto', txtEmail.value);
                if (temArquivo) formData.append('arquivo', fileUpload.files[0]);

                // URL da API (ajuste conforme ambiente)
                const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
                const renderURL = 'https://case-autou-backend.onrender.com/analisar';
                // const apiURL = isLocal ? 'http://127.0.0.1:5000/analisar' : `${renderURL}/analisar`;

                // Envia requisição para API
                fetch(renderURL, {
                    method: 'POST',
                    body: formData,
                    mode: 'cors' // Garante CORS
                })
                .then(response => {
                    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (data.erro) { throw new Error(data.detalhes || data.erro); }
                    // Exibe resultados
                    boxAnaliseResultados.innerHTML = createResultadosHTML(data);
                    animarResultados();
                    boxAnaliseResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    lucide.createIcons();
                    ativarBotaoCopiar();
                    gsap.to(".boxPrincipal", { duration: 0.5, autoAlpha: 1, scale: 1, ease: "power2.out" });
                })
                .catch(error => {
                    // Exibe erro
                    console.error('Erro na requisição:', error);
                    boxAnaliseResultados.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
                    gsap.to(".boxPrincipal", { duration: 0.5, autoAlpha: 1, scale: 1, ease: "power2.out" });
                });
            } else {
                // Nenhum dado para analisar
                alert('Por favor, insira o texto de um e-mail ou faça o upload de um arquivo para analisar.');
            }
        });
    }
});