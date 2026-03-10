from services.nlp import classify_issue
from services.indiankanoon import search_cases
from services.ipcMapper import map_statute_sections
from services.gemini_service import classify_with_ai, DISCLAIMER
from services.legalLogic import generate_legal_guidance

#BUILD JUDGMENT QUERY

def build_judgment_query(category: str, statute_data: dict, issue_text: str = ""):

    if category == "Criminal":

        ipc_sections = statute_data.get("ipc_sections", [])

        if ipc_sections:
            section_number = ipc_sections[0]["section"].split()[0]
            return f"Section {section_number} IPC criminal case judgment India", True

        if issue_text:
            return issue_text, False

    if category == "Family":
        return "family court divorce custody judgment India", False

    if category == "Consumer":
        return "consumer dispute commission judgment India", False

    if category == "Civil":
        if issue_text:
            return issue_text, False

    return None, False

#MAIN ANALYZER
def analyze_case(data: dict):

    print("ANALYZER STEP 1: start")

    original_issue = data.get("original_issue", "")
    processed_issue = data.get("issue", "")

    print("ANALYZER STEP 2: classification")

    category, category_confidence = classify_issue(processed_issue)

    if category_confidence < 0.5:
        print("ANALYZER STEP 3: AI fallback classification")
        category, category_confidence = classify_with_ai(processed_issue)

    print("ANALYZER STEP 4: statute mapping")

    statute_data = map_statute_sections(original_issue, processed_issue)

    print("ANALYZER STEP 5: generating guidance")

    legal_guidance = generate_legal_guidance({
        "category": category,
        "issue": processed_issue
    })

    print("ANALYZER STEP 6: searching judgments")

    query, skip_first = build_judgment_query(
        category,
        statute_data,
        processed_issue
    )

    judgments = search_cases(query, skip_first) if query else []

    print("ANALYZER STEP 7: finished")

    confidence_value = None

    if category == "Criminal":
        confidence_value = statute_data.get("confidence")
    else:
        try:
            confidence_value = round(float(category_confidence), 2)
        except:
            confidence_value = category_confidence

    return {
        "detected_category": category,
        "confidence_level": confidence_value,
        "ipc_sections": statute_data.get("ipc_sections", []),
        "bns_sections": statute_data.get("bns_sections", []),
        "legal_guidance": legal_guidance,
        "related_judgments": judgments,
        "disclaimer": DISCLAIMER
    }
