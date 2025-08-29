# InsightMail - Classificador Inteligente de E-mails

> Projeto de case prático desenvolvido para o processo seletivo da AutoU. A aplicação utiliza a API da OpenAI (GPT) para classificar e-mails em "Produtivos" ou "Improdutivos" e sugerir respostas adequadas.

---

### ✨ Features Principais

* **Classificação com IA:** Analisa o conteúdo de um e-mail para determinar sua natureza (produtiva ou improdutiva).
* **Sugestão de Resposta:** Gera automaticamente uma resposta adequada com base na classificação.
* **Múltiplos Formatos de Entrada:** Permite a análise tanto de texto colado quanto de arquivos (`.pdf`, `.docx`, `.txt`).
* **Interface Intuitiva:** Um frontend limpo e direto que alterna inteligentemente entre os métodos de entrada.

---

### 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Puro)
* **Backend:** Python 3, Flask
* **Inteligência Artificial:** OpenAI (GPT-5-mini)
* **Deploy:** Vercel

---

### 📄 Como Rodar o Projeto Localmente

Siga os passos abaixo para executar a aplicação na sua máquina.

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd NOME_DA_PASTA_DO_PROJETO
    ```

2.  **Configure o Backend:**
    * Navegue até a pasta do backend:
        ```bash
        cd backend
        ```
    * Crie e ative um ambiente virtual:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    * Instale as dependências:
        ```bash
        pip install -r requirements.txt
        ```
    * Crie um arquivo `.env` na pasta `backend` e adicione sua chave da API:
        ```
        OPENAI_API_KEY="sk-xxxxxxxxxx"
        ```

3.  **Execute a Aplicação:**
    * Ainda na pasta `backend`, inicie o servidor Flask:
        ```bash
        flask --app app run
        ```
    * O backend estará rodando em `http://127.0.0.1:5000`.

4.  **Abra o Frontend:**
    * Navegue até a pasta `frontend` e abra o arquivo `index.html` no seu navegador.

---

### 🔗 Demonstração Online

*Você pode testar a aplicação ao vivo no seguinte link:*

**(https://case-autou-git-main-matheus-tsujis-projects.vercel.app/)**