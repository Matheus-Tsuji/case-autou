# === Importações necessárias ===
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

# === Configuração do cliente OpenAI ===
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# === Função principal de análise com IA ===
def analisar_texto_com_ia(texto_email):
    """
    Envia o texto do e-mail para a API da OpenAI e retorna uma análise estruturada em JSON.
    """
    prompt = f"""
    Analise o seguinte texto de um email e forneça uma análise completa no formato JSON. O email é:
    ---
    {texto_email}
    ---
    Por favor, retorne um objeto JSON VÁLIDO com a seguinte estrutura e chaves:
    {{
      "classificacao": "Produtivo" ou "Improdutivo",
      "confianca": um número de 0 a 100 indicando a confiança na classificação,
      "analise": "Uma breve justificativa em uma frase sobre o porquê da classificação.",
      "resposta_sugerida": "Um texto curto e profissional como sugestão de resposta, apropriado para a classificação.",
      "palavras_chave": ["uma", "lista", "de", "3", "a", "5", "palavras-chave", "importantes", "do", "texto"]
    }}
    """

    try:
        response = client.chat.completions.create(
            # AQUI ESTÁ A CORREÇÃO:
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um assistente de produtividade especialista em analisar e classificar emails. Responda sempre com um JSON válido."},
                {"role": "user", "content": prompt}
            ],
        )

        json_response_string = response.choices[0].message.content
        resultado_analise = json.loads(json_response_string)

        if 'resposta_sugerida' in resultado_analise:
            resultado_analise['resposta'] = resultado_analise.pop('resposta_sugerida')
        resultado_analise['nivelConfianca'] = "Alta" if resultado_analise.get('confianca', 0) > 80 else "Média"
        resultado_analise['texto_original'] = texto_email

        return resultado_analise

    except Exception as e:
        print(f"Erro ao chamar a API da OpenAI: {e}")
        return {
            "erro": "Não foi possível analisar o texto com a IA.",
            "detalhes": str(e)
        }