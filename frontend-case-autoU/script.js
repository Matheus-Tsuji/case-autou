document.addEventListener('DOMContentLoaded', () => {
    // ===============================
    // 1. Seleção dos elementos da interface
    // ===============================
    const uploadBox = document.getElementById('uploadBox'); // Área de upload (drag & drop)
    const fileUpload = document.getElementById('fileUpload'); // Input de arquivo
    const fileNameDisplay = document.getElementById('fileNameDisplay'); // Exibe nome do arquivo
    const btnAnalisar = document.getElementById('btnAnalisar'); // Botão principal
    const txtEmail = document.getElementById('txtEmail'); // Textarea do e-mail
    const boxAnaliseResultados = document.getElementById('boxAnaliseResultados'); // Área de resultados

    // ===============================
    // 2. Upload de arquivo: drag & drop e seleção manual
    // ===============================
    // Atualiza o nome do arquivo exibido ao usuário
    function atualizarNomeArquivo(input) {
        if (input.files.length > 0) {
            fileNameDisplay.textContent = input.files[0].name;
        } else {
            fileNameDisplay.textContent = 'Nenhum arquivo selecionado.';
        }
    }
    // Eventos de clique, arrastar e soltar para upload
    if (uploadBox) {
        uploadBox.addEventListener('click', () => fileUpload.click());
        fileUpload.addEventListener('change', () => atualizarNomeArquivo(fileUpload));
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
    // 3. Sincronização dos inputs (texto x arquivo)
    // ===============================
    // Se selecionar arquivo, limpa textarea. Se digitar, limpa arquivo.
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
    // 4. HTML de loading durante análise
    // ===============================
    const loadingHTML = `
        <div class="analise-loading">
            <span class="loading-spinner"></span>
            <h4>Analisando<span>...</span></h4>
        </div>
    `;

    // ===============================
    // 5. Monta o HTML dos resultados da análise
    // ===============================
    // Recebe o objeto de resposta da API e gera o bloco de resultados
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
                    <h5 class="coluna-titulo"><i data-lucide="message-square" style="color: #F5551C"></i> Resposta Sugerida</h5>
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
    // 6. Botão de copiar resposta sugerida
    // ===============================
    // Permite copiar a resposta sugerida para a área de transferência
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
    // 7. Clique no botão "Analisar" (envia dados, exibe resultado)
    // ===============================
    if (btnAnalisar) {
        btnAnalisar.addEventListener('click', () => {
            const temTexto = txtEmail.value.trim() !== '';
            const temArquivo = fileUpload.files.length > 0;

            if (temTexto || temArquivo) {
                boxAnaliseResultados.innerHTML = loadingHTML;
                boxAnaliseResultados.classList.remove('hidden');

                const formData = new FormData();
                formData.append('texto', txtEmail.value);
                if (temArquivo) formData.append('arquivo', fileUpload.files[0]);

                // Faz a requisição para a API Flask (ajuste a URL conforme seu deploy)
                fetch('/api/app', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error('Erro na resposta do servidor');
                    return response.json();
                })
                .then(data => {
                    boxAnaliseResultados.innerHTML = createResultadosHTML(data);
                    boxAnaliseResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    lucide.createIcons();
                    ativarBotaoCopiar();
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    boxAnaliseResultados.innerHTML = '<p style="color: red; text-align: center;">Erro ao conectar com o servidor.</p>';
                });
            } else {
                alert('Por favor, insira o texto de um e-mail ou faça o upload de um arquivo para analisar.');
            }
        });
    }
});