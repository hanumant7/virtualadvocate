import json
import re
from services.gemini_service import generate_ai_guidance

def generate_legal_guidance(data: dict):
    category = data.get("category")
    issue = data.get("issue")

    # ----------------------------------------
    # 1️⃣ TRY AI FIRST
    # ----------------------------------------

    ai_response = generate_ai_guidance(category, issue)

    if ai_response and "Unable to generate" not in ai_response:
        try:
            # Remove markdown code block formatting if present
            cleaned = re.sub(r"```json|```", "", ai_response).strip()

            # Convert string JSON to Python dictionary
            parsed_response = json.loads(cleaned)

            return parsed_response

        except Exception:
            # If parsing fails, continue to fallback
            pass

    # ----------------------------------------
    # 2️⃣ RULE-BASED FALLBACK
    # ----------------------------------------

    if category == "Criminal":
        return {
            "law": "Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS)",
            "advice": "This issue appears to involve a criminal offence.",
            "procedure": [
                "File an FIR at the nearest police station",
                "Preserve all evidence",
                "Consult a criminal lawyer"
            ],
            "note": "Criminal cases involve offences against the State."
        }

    if category == "Civil":
        return {
            "law": "Code of Civil Procedure (CPC), 1908",
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
            "law": "Family Laws (HMA / CrPC / DV Act)",
            "advice": "This appears to be a family-related dispute.",
            "procedure": [
                "Approach family court",
                "Consider mediation"
            ],
            "note": "Family courts encourage settlement."
        }

    if category == "Consumer":
        return {
            "law": "Consumer Protection Act, 2019",
            "advice": "This appears to be a consumer dispute.",
            "procedure": [
                "Collect receipts",
                "File complaint in Consumer Commission"
            ],
            "note": "Lawyer not mandatory in consumer courts."
        }

    return {
        "law": "General Legal Guidance",
        "advice": "More information is required.",
        "procedure": ["Consult a lawyer"],
        "note": "This guidance is general in nature."
    }
