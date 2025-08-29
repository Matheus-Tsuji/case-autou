# app.py (versão final de produção para Render)

from flask import Flask, request, jsonify
from flask_cors import CORS
import docx
import fitz
import traceback
from analise_ia import analisar_texto_com_ia

app = Flask(__name__)

# CONFIGURAÇÃO DE CORS EXPLÍCITA E ROBUSTA (A SOLUÇÃO)
CORS(app, resources={r"/analisar": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# O resto do seu código de leitura de arquivos
def ler_arquivo_docx(arquivo_stream):
    try:
        doc = docx.Document(arquivo_stream)
        return "\n".join([para.text for para in doc.paragraphs])
    except: return ""

def ler_arquivo_pdf(arquivo_stream):
    try:
        with fitz.open(stream=arquivo_stream.read(), filetype="pdf") as doc:
            return "\n".join([page.get_text() for page in doc])
    except: return ""

@app.route('/analisar', methods=['POST'])
def analisar_email():
    try:
        texto_final_para_analise = ""
        texto_do_formulario = request.form.get('texto', '').strip()
        if texto_do_formulario:
            texto_final_para_analise = texto_do_formulario
        elif 'arquivo' in request.files:
            arquivo = request.files['arquivo']
            if arquivo.filename == '': return jsonify({"erro": "Nenhum arquivo"}), 400
            if arquivo.filename.endswith('.docx'): texto_final_para_analise = ler_arquivo_docx(arquivo.stream)
            elif arquivo.filename.endswith('.pdf'): texto_final_para_analise = ler_arquivo_pdf(arquivo.stream)
            elif arquivo.filename.endswith('.txt'): texto_final_para_analise = arquivo.stream.read().decode("utf-8")
            else: return jsonify({"erro": "Formato não suportado"}), 400

        if not texto_final_para_analise: return jsonify({"erro": "Nenhum conteúdo"}), 400

        resultado_final = analisar_texto_com_ia(texto_final_para_analise)
        if "erro" in resultado_final: return jsonify(resultado_final), 500
        return jsonify(resultado_final)
    except Exception:
        traceback.print_exc()
        return jsonify({"erro": "Erro interno no servidor."}), 500

if __name__ == '__main__':
    app.run(debug=True)