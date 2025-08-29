document.addEventListener('DOMContentLoaded', () => {
    // ===============================
    // 1. Seleção dos elementos da interface
    // ===============================
    const uploadBox = document.getElementById('uploadBox');
    const fileUpload = document.getElementById('fileUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const btnAnalisar = document.getElementById('btnAnalisar');
    const txtEmail = document.getElementById('txtEmail');
    const boxAnaliseResultados = document.getElementById('boxAnaliseResultados');

    // ===============================
    // 2. Animação inicial da página (GSAP)
    // ===============================
    lucide.createIcons();
    gsap.set(['header', '.boxPrincipal'], { autoAlpha: 0 });
    const tl = gsap.timeline();
    tl.to("header", { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" })
      .to(".boxPrincipal", { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");

    // ===============================
    // 3. Upload de arquivo: drag & drop e seleção manual
    // ===============================
    function atualizarNomeArquivo(input) {
        if (input.files.length > 0) {
            fileNameDisplay.textContent = input.files[0].name;
        } else {
            fileNameDisplay.textContent = 'Nenhum arquivo selecionado.';
        }
    }
    if (uploadBox) {
        uploadBox.addEventListener('click', () => fileUpload.click());
        uploadBox.addEventListener('change', () => atualizarNomeArquivo(fileUpload));
        uploadBox.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadBox.classList.add('dragover');
        });
        uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
        uploadBox.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadBox.classList.remove('dragover');
            if (event.dataTransfer.files.length > 0) {
                fileUpload.files = event.dataTransfer.files;
                atualizarNomeArquivo(fileUpload);
            }
        });
    }

    // ===============================
    // 4. Sincronização dos inputs (texto x arquivo)
    // ===============================
    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length > 0) txtEmail.value = '';
    });
    txtEmail.addEventListener('input', () => {
        if (txtEmail.value.trim() !== '' && fileUpload.files.length > 0) {
            fileUpload.value = null;
            atualizarNomeArquivo(fileUpload);
        }
    });

    // ===============================
    // 5. HTML de loading durante análise
    // ===============================
    const loadingHTML = `
        <div class="analise-loading">
            <span class="loading-spinner"></span>
            <h4>Analisando<span>...</span></h4>
        </div>
    `;

    // ===============================
    // 6. Monta o HTML dos resultados da análise
    // ===============================
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

    // ===============================
    // 7. Animação dos resultados (GSAP)
    // ===============================
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

    // ===============================
    // 8. Botão de copiar resposta sugerida
    // ===============================
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

    // ===============================
    // 9. Clique no botão "Analisar" (envia dados, anima, exibe resultado)
    // ===============================
    if (btnAnalisar) {
        btnAnalisar.addEventListener('click', () => {
            const temTexto = txtEmail.value.trim() !== '';
            const temArquivo = fileUpload.files.length > 0;

            if (temTexto || temArquivo) {
                gsap.to(".boxPrincipal", { duration: 0.5, autoAlpha: 0.5, scale: 0.98, ease: "power2.in" });
                boxAnaliseResultados.innerHTML = loadingHTML;
                boxAnaliseResultados.classList.remove('hidden');
                gsap.from(boxAnaliseResultados, { duration: 0.5, y: 50, autoAlpha: 0, ease: "power2.out", delay: 0.2 });

                const formData = new FormData();
                formData.append('texto', txtEmail.value);
                if (temArquivo) formData.append('arquivo', fileUpload.files[0]);

                const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
                
                // AQUI ESTÁ A CORREÇÃO FINAL E DEFINITIVA
                const renderURL = 'https://case-autou-msov.onrender.com'; // Sua URL da Render
                const apiURL = isLocal ? 'http://127.0.0.1:5000/analisar' : `${renderURL}/analisar`;

                fetch(apiURL, {
                    method: 'POST',
                    body: formData,
                    mode: 'cors' // Adicionado para garantir CORS
                })
                .then(response => {
                    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (data.erro) { throw new Error(data.detalhes || data.erro); }
                    boxAnaliseResultados.innerHTML = createResultadosHTML(data);
                    animarResultados();
                    boxAnaliseResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    lucide.createIcons();
                    ativarBotaoCopiar();
                    gsap.to(".boxPrincipal", { duration: 0.5, autoAlpha: 1, scale: 1, ease: "power2.out" });
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    boxAnaliseResultados.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
                    gsap.to(".boxPrincipal", { duration: 0.5, autoAlpha: 1, scale: 1, ease: "power2.out" });
                });
            } else {
                alert('Por favor, insira o texto de um e-mail ou faça o upload de um arquivo para analisar.');
            }
        });
    }
});