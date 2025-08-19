# portfolio/utils/ai_finance.py
import json
import openai
from django.conf import settings

class AIFinanceError(Exception):
    pass

def fetch_description_and_thesis(stock_payload: dict) -> dict:
    """
    Uses OpenAI GPT to generate a company description and investment thesis.
    Expects keys in stock_payload: symbol, name, exchange, sector, market_cap, website_url
    """
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        # If no API key, return empty fields
        return {"description": "", "investment_thesis": ""}

    openai.api_key = api_key

    prompt = f"""
You are a financial research assistant. Given this stock, return ONLY a compact JSON with exactly:
- description: concise 1–3 sentence overview
- investment_thesis: one short sentence on why investors may consider it (or the key risk)

Stock:
symbol: {stock_payload.get('symbol')}
name: {stock_payload.get('name')}
exchange: {stock_payload.get('exchange')}
sector: {stock_payload.get('sector')}
market_cap: {stock_payload.get('market_cap')}
website_url: {stock_payload.get('website_url')}

Return strictly valid JSON with keys: description, investment_thesis.
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300
        )
        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)
        return {
            "description": (parsed.get("description") or "").strip(),
            "investment_thesis": (parsed.get("investment_thesis") or "").strip(),
        }
    except Exception as e:
        # fallback in case of error
        return {"description": "", "investment_thesis": ""}
