import json
import re
from services.gemini_service import generate_ai_guidance

def extract_json(text):

    if not text:
        return None

    # If Gemini already returned JSON (dict), just return it
    if isinstance(text, dict):
        return text

    # If response is string, try extracting JSON
    if isinstance(text, str):

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            return None

        cleaned = match.group(0)

        cleaned = re.sub(r",\s*}", "}", cleaned)
        cleaned = re.sub(r",\s*]", "]", cleaned)

        try:
            return json.loads(cleaned)
        except Exception:
            return None

    return None


def generate_legal_guidance(data: dict):

    category = data.get("category")
    issue = data.get("issue")

    ai_response = generate_ai_guidance(category, issue)

    parsed = extract_json(ai_response)

    if parsed:
        return parsed

    if category == "Criminal":
        return {
            "law": "Indian Penal Code / Bharatiya Nyaya Sanhita",
            "advice": "This issue appears to involve a criminal offence.",
            "procedure": [
                "File FIR at nearest police station",
                "Preserve evidence",
                "Consult criminal lawyer"
            ],
            "note": "Criminal offences are prosecuted by the State."
        }

    if category == "Civil":
        return {
            "law": "Code of Civil Procedure",
            "advice": "This appears to be a civil dispute.",
            "procedure": [
                "Collect documents",
                "Send legal notice",
                "File civil suit"
            ],
            "note": "Civil disputes involve private rights."
        }

    if category == "Family":
        return {
            "law": "Family Laws (HMA / DV Act / CrPC)",
            "advice": "This appears to be a family dispute.",
            "procedure": [
                "Approach family court",
                "Consider mediation"
            ],
            "note": "Family courts often encourage settlement."
        }

    if category == "Consumer":
        return {
            "law": "Consumer Protection Act 2019",
            "advice": "This appears to be a consumer complaint.",
            "procedure": [
                "Collect bills and receipts",
                "File complaint in Consumer Commission"
            ],
            "note": "Lawyer is not mandatory in consumer courts."
        }

    return {
        "law": "General Legal Guidance",
        "advice": "More information required.",
        "procedure": ["Consult a lawyer"],
        "note": "Information provided is general."
    }