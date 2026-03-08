import os
from dotenv import load_dotenv
from google import genai

# =========================================================
# ENV CONFIGURATION
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

# =========================================================
# CORE GEMINI CALL
# =========================================================

def ask_gemini(prompt: str):
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        if response and response.text:
            return response.text.strip()

        return None

    except Exception as e:
        print("Gemini API Error:", str(e))
        return None


# =========================================================
# GENERAL CHAT REPLY (USED IN /chat ENDPOINT)
# =========================================================

import json

def generate_reply(user_message: str):
    """
    Structured Gemini Chat Mode
    """

    prompt = f"""
    You are Virtual Advocate AI, an Indian legal information assistant.

    STRICT INSTRUCTIONS:
    - Respond ONLY in valid JSON.
    - Do NOT include markdown.
    - Do NOT include explanation before or after JSON.
    - Do NOT wrap JSON in ``` blocks.
    - Provide general legal information only.
    - Encourage consulting a licensed advocate.

    JSON FORMAT:

    {{
      "summary": "Short overview of the issue",
      "applicable_laws": ["Law 1", "Law 2"],
      "legal_options": ["Option 1", "Option 2"],
      "next_steps": ["Step 1", "Step 2"],
      "note": "General informational disclaimer"
    }}

    User Query:
    {user_message}
    """

    response = ask_gemini(prompt)

    if not response:
        return json.dumps({
            "summary": "Unable to process the request.",
            "applicable_laws": [],
            "legal_options": [],
            "next_steps": [],
            "note": "Please consult a qualified advocate."
        })

    # Extract JSON safely
    import re
    match = re.search(r"\{.*\}", response, re.DOTALL)

    if not match:
        return json.dumps({
            "summary": response,
            "applicable_laws": [],
            "legal_options": [],
            "next_steps": [],
            "note": "Please consult a qualified advocate."
        })

    try:
        parsed = json.loads(match.group(0))
        return json.dumps(parsed)
    except:
        return json.dumps({
            "summary": response,
            "applicable_laws": [],
            "legal_options": [],
            "next_steps": [],
            "note": "Please consult a qualified advocate."
        })


# =========================================================
# AI CLASSIFICATION (Fallback)
# =========================================================

def classify_with_ai(issue_text: str):

    prompt = f"""
    Classify the following issue into ONLY ONE category:
    Criminal, Family, Consumer, Civil.

    Issue:
    {issue_text}

    Return ONLY the category name.
    """

    result = ask_gemini(prompt)

    if result and result.strip() in ["Criminal", "Family", "Consumer", "Civil"]:
        return result.strip(), "AI-Detected"

    return "Civil", "Low"


# =========================================================
# AI LEGAL GUIDANCE (Structured JSON)
# =========================================================

def generate_ai_guidance(category: str, issue_text: str):

    prompt = f"""
    You are Virtual Advocate, an Indian legal information assistant.

    IMPORTANT:
    - Use latest Indian criminal laws where applicable.
    - Prefer Bharatiya Nyaya Sanhita (BNS), 2023.
    - Prefer Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.
    - Prefer Bharatiya Sakshya Adhiniyam (BSA), 2023.
    - Mention IPC/CrPC only if historically relevant.
    - You are NOT a lawyer.
    - Do NOT provide final legal advice.
    - Encourage consulting a licensed advocate.

    Respond ONLY in valid JSON format:

    {{
      "law": "...",
      "advice": "...",
      "procedure": ["step1", "step2"],
      "note": "disclaimer"
    }}

    Category: {category}
    Issue: {issue_text}
    """

    response = ask_gemini(prompt)

    return response if response else "Unable to generate guidance at this time."


# =========================================================
# TRANSLATION SUPPORT
# =========================================================

def translate_text(text: str, target_language: str):

    prompt = f"""
    Translate the following legal explanation into {target_language}.
    Keep language simple and clear.

    Text:
    {text}
    """

    return ask_gemini(prompt)