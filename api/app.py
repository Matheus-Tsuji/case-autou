
# === Importações principais ===
from flask import Flask, request, jsonify  # Framework web e utilidades
from flask_cors import CORS               # Permite requisições de outros domínios (frontend)
import docx                               # Para ler arquivos .docx
import fitz                               # Para ler arquivos .pdf (PyMuPDF)
from analise_ia import analisar_texto_com_ia  # Função de análise IA

# === Inicialização do app Flask ===
app = Flask(__name__)
CORS(app)  # Habilita CORS para permitir acesso do frontend

# === Função auxiliar: leitura de arquivos DOCX ===
def ler_arquivo_docx(arquivo_stream):
    """Lê um arquivo .docx enviado e retorna o texto completo."""
    try:
        doc = docx.Document(arquivo_stream)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Erro ao ler DOCX: {e}")
        return ""

# === Função auxiliar: leitura de arquivos PDF ===
def ler_arquivo_pdf(arquivo_stream):
    """Lê um arquivo .pdf enviado e retorna o texto completo."""
    try:
        with fitz.open(stream=arquivo_stream.read(), filetype="pdf") as doc:
            return "\n".join([page.get_text() for page in doc])
    except Exception as e:
        print(f"Erro ao ler PDF: {e}")
        return ""

# === Rota principal da API: análise de e-mail ===
@app.route('/analisar', methods=['POST'])
def analisar_email():
    """
    Recebe texto ou arquivo do frontend, consolida o conteúdo e envia para análise da IA.
    Retorna o resultado estruturado ou mensagem de erro.
    """
    texto_final_para_analise = ""

    # 1. Tenta extrair texto do campo de formulário
    texto_do_formulario = request.form.get('texto', '').strip()
    if texto_do_formulario:
        texto_final_para_analise = texto_do_formulario
    # 2. Se não houver texto, tenta extrair de arquivo enviado
    elif 'arquivo' in request.files:
        arquivo = request.files['arquivo']
        if arquivo.filename == '':
            return jsonify({"erro": "Nenhum arquivo selecionado"}), 400
        if arquivo.filename.endswith('.docx'):
            texto_final_para_analise = ler_arquivo_docx(arquivo.stream)
        elif arquivo.filename.endswith('.pdf'):
            texto_final_para_analise = ler_arquivo_pdf(arquivo.stream)
        elif arquivo.filename.endswith('.txt'):
            texto_final_para_analise = arquivo.stream.read().decode("utf-8")
        else:
            return jsonify({"erro": "Formato de arquivo não suportado"}), 400

    # 3. Se não houver conteúdo, retorna erro
    if not texto_final_para_analise:
        return jsonify({"erro": "Nenhum conteúdo para analisar"}), 400

    print(f"Texto enviado para a IA: {texto_final_para_analise[:100]}...")

    # 4. Chama a função de análise IA
    resultado_final = analisar_texto_com_ia(texto_final_para_analise)

    # 5. Se houver erro na análise, retorna erro 500
    if "erro" in resultado_final:
        return jsonify(resultado_final), 500

    # 6. Retorna resultado final em JSON
    return jsonify(resultado_final)

# === Execução do servidor Flask ===
if __name__ == '__main__':
    app.run(debug=True)