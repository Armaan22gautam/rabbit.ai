"""AI engine service: generates executive summaries using the Gemini REST API."""

import json
import httpx
import logging
from app.config import settings

# Initialize modular logger for AI operations
logger = logging.getLogger(__name__)

# Fallback HTML summary to use in case of API issues or rate limits
MOCK_SUMMARY = """
<h2>Executive Summary</h2>
<p>This is a system-generated fallback report because the Google Gemini API quota limit was reached or a connection error occurred.</p>
<p>The analyzed dataset <strong>{filename}</strong> indicates strong overall performance, with key products driving the majority of top-line revenue.</p>
<h3>Key Metrics</h3>
<ul>
    <li><b>Total Revenue:</b> ${total_revenue}</li>
    <li><b>Total Units Sold:</b> {total_units_sold}</li>
    <li><b>Data Volume:</b> {total_rows} rows analyzed successfully</li>
</ul>
<p>Based on the quantitative analysis, we recommend focusing on high-performing regions to maximize margins.</p>
"""


async def generate_summary(data_summary: dict) -> str:
    """Generates a professional sales brief using Gemini REST API.

    Args:
        data_summary: Dictionary containing parsed statistics and sample data.

    Returns:
        HTML-formatted executive summary.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured. Using fallback summary.")
        return format_fallback(data_summary)

    prompt = f"""
    You are an expert sales analyst. Analyze the following data summary and generate a 
    professional, high-level executive summary in HTML format (using <h2>, <h3>, <p>, <ul>, <li>).
    
    Data Summary:
    {json.dumps(data_summary, indent=2, default=str)}
    
    The summary should include:
    1. A bird's eye view of the performance.
    2. Specific highlights based on metrics like total revenue or top rows.
    3. Strategic recommendations for the sales team.
    
    Return ONLY valid HTML. No markdown code blocks.
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            summary_html = result["candidates"][0]["content"]["parts"][0]["text"]
            
            # Clean up potential markdown if the model ignored instructions
            summary_html = summary_html.replace("```html", "").replace("```", "").strip()
            return summary_html

    except Exception as e:
        logger.error(f"Error calling Gemini REST API: {e}")
        return format_fallback(data_summary)


def format_fallback(data: dict) -> str:
    """Helper to format the mock summary with available data."""
    return MOCK_SUMMARY.format(
        filename=data.get("filename", "Unknown"),
        total_rows=data.get("total_rows", "N/A"),
        total_revenue=data.get("total_revenue", "0.0"),
        total_units_sold=data.get("total_units_sold", "0")
    )
