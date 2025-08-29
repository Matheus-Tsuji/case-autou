
# ===============================
# app.py — Backend Flask para análise de e-mails/arquivos
# ===============================

from flask import Flask, request, jsonify  # Framework web e utilidades
from flask_cors import CORS               # Permite requisições de outros domínios (CORS)
import docx                               # Leitura de arquivos .docx
import fitz                               # Leitura de arquivos .pdf (PyMuPDF)
import traceback                          # Para exibir erros detalhados no log
from analise_ia import analisar_texto_com_ia  # Função de análise IA (implementação separada)

# Inicializa a aplicação Flask
app = Flask(__name__)

# Configuração de CORS para permitir requisições de qualquer origem no endpoint /analisar
CORS(app, resources={r"/analisar": {"origins": "*"}})

# Garante que todos os headers necessários de CORS estejam presentes nas respostas
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# ===============================
# Funções utilitárias para leitura de arquivos
# ===============================

# Lê o conteúdo de um arquivo .docx e retorna como string
def ler_arquivo_docx(arquivo_stream):
    try:
        doc = docx.Document(arquivo_stream)
        return "\n".join([para.text for para in doc.paragraphs])
    except:
        return ""

# Lê o conteúdo de um arquivo .pdf e retorna como string
def ler_arquivo_pdf(arquivo_stream):
    try:
        with fitz.open(stream=arquivo_stream.read(), filetype="pdf") as doc:
            return "\n".join([page.get_text() for page in doc])
    except:
        return ""

# ===============================
# Endpoint principal: /analisar
# Recebe texto ou arquivo, processa e retorna análise
# ===============================
@app.route('/analisar', methods=['POST'])
def analisar_email():
    try:
        texto_final_para_analise = ""
        # Tenta obter texto enviado pelo formulário
        texto_do_formulario = request.form.get('texto', '').strip()
        if texto_do_formulario:
            texto_final_para_analise = texto_do_formulario
        # Se não houver texto, tenta ler arquivo enviado
        elif 'arquivo' in request.files:
            arquivo = request.files['arquivo']
            if arquivo.filename == '':
                return jsonify({"erro": "Nenhum arquivo"}), 400
            if arquivo.filename.endswith('.docx'):
                texto_final_para_analise = ler_arquivo_docx(arquivo.stream)
            elif arquivo.filename.endswith('.pdf'):
                texto_final_para_analise = ler_arquivo_pdf(arquivo.stream)
            elif arquivo.filename.endswith('.txt'):
                texto_final_para_analise = arquivo.stream.read().decode("utf-8")
            else:
                return jsonify({"erro": "Formato não suportado"}), 400

        # Se não houver conteúdo, retorna erro
        if not texto_final_para_analise:
            return jsonify({"erro": "Nenhum conteúdo"}), 400

        # Chama função de análise IA (implementação em analise_ia.py)
        resultado_final = analisar_texto_com_ia(texto_final_para_analise)
        if "erro" in resultado_final:
            return jsonify(resultado_final), 500
        return jsonify(resultado_final)
    except Exception:
        # Loga o erro no console e retorna erro genérico para o frontend
        traceback.print_exc()
        return jsonify({"erro": "Erro interno no servidor."}), 500

# ===============================
# Execução local (debug)
# ===============================
if __name__ == '__main__':
    app.run(debug=True)