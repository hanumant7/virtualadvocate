from services.nlp import classify_issue
from services.indiankanoon import search_cases
from services.ipcMapper import map_statute_sections
from services.gemini_service import classify_with_ai
from services.legalLogic import generate_legal_guidance


# =========================================================
# MULTILINGUAL KEYWORDS
# =========================================================

CRIMINAL_KEYWORDS = {
    "en": [
        "murder", "killed", "kill", "homicide", "rape",
        "assault", "theft", "robbery", "fraud", "cheating",
        "dowry", "harassment", "kidnapping",
        "death", "stabbed", "shot", "poisoned"
    ],
    "hi": [
        "खून", "हत्या", "मार डाला", "मार दिया",
        "बलात्कार", "चोरी", "डकैती", "अपहरण", "दहेज"
    ],
    "mr": [
        "खून", "हत्या", "मारले", "मारला",
        "बलात्कार", "चोरी", "अपहरण", "हुंडा"
    ]
}

FAMILY_KEYWORDS = {
    "en": [
        "divorce", "separation", "custody",
        "alimony", "maintenance", "marriage",
        "husband", "wife"
    ],
    "hi": [
        "तलाक", "विवाह", "पति", "पत्नी",
        "भरण पोषण", "हिरासत"
    ],
    "mr": [
        "घटस्फोट", "लग्न", "पती", "पत्नी",
        "पालनपोषण", "हक्क"
    ]
}

CONSUMER_KEYWORDS = {
    "en": [
        "refund", "return", "warranty",
        "product", "service", "bill",
        "invoice", "defective", "delay"
    ],
    "hi": ["रिफंड", "सेवा", "उत्पाद", "बिल"],
    "mr": ["परतावा", "सेवा", "उत्पादन", "बिल"]
}


# =========================================================
# HELPERS
# =========================================================

def contains_multilingual(text: str, keyword_dict: dict) -> bool:
    if not text:
        return False
    text = text.lower()
    for words in keyword_dict.values():
        if any(word in text for word in words):
            return True
    return False


def build_judgment_query(category: str, statute_data: dict, issue_text: str = ""):

    # 🔴 Criminal → Section-based query
    if category == "Criminal":
        ipc_sections = statute_data.get("ipc_sections", [])

        if ipc_sections:
            # Extract only section number (e.g., "302" from "302 IPC")
            section_number = ipc_sections[0]["section"].split()[0]

            return f"Section {section_number} Indian criminal case judgment", True

        # Fallback to issue-based search
        if issue_text:
            return issue_text, False

    # 🟣 Family
    if category == "Family":
        return "family court divorce custody judgment India", False

    # 🟡 Consumer
    if category == "Consumer":
        return "consumer dispute commission judgment India", False

    # 🔵 Civil
    if issue_text:
        return issue_text, False

    return None, False



# =========================================================
# MAIN ANALYZER
# =========================================================

def analyze_case(data: dict):

    original_issue = data.get("original_issue", "")
    processed_issue = data.get("issue", "")

    combined_text = f"{original_issue} {processed_issue}".lower()

    # -----------------------------------------------------
    # STEP 1: CATEGORY DETECTION
    # -----------------------------------------------------

    if contains_multilingual(combined_text, CRIMINAL_KEYWORDS):
        category = "Criminal"
        category_confidence = "High"

    elif contains_multilingual(combined_text, FAMILY_KEYWORDS):
        category = "Family"
        category_confidence = "High"

    elif contains_multilingual(combined_text, CONSUMER_KEYWORDS):
        category = "Consumer"
        category_confidence = "Medium"

    else:
        category, category_confidence = classify_issue(processed_issue)

        if category_confidence == "Low":
            category, category_confidence = classify_with_ai(processed_issue)

    # -----------------------------------------------------
    # STEP 2: LEGAL GUIDANCE (Gemini)
    # -----------------------------------------------------

    legal_guidance = generate_legal_guidance({
        "category": category,
        "issue": processed_issue
    })

    # -----------------------------------------------------
    # STEP 3: STATUTE MAPPING
    # -----------------------------------------------------

    statute_data = map_statute_sections(original_issue, processed_issue)

    # -----------------------------------------------------
    # STEP 4: JUDGMENT SEARCH
    # -----------------------------------------------------

    query, skip_first = build_judgment_query(category,statute_data,processed_issue)
    judgments = search_cases(query, skip_first) if query else []

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {
        "detected_category": category,
        "confidence_level": (
            statute_data.get("confidence")
            if category == "Criminal"
            else category_confidence
        ),
        "ipc_sections": statute_data.get("ipc_sections", []),
        "bns_sections": statute_data.get("bns_sections", []),
        "legal_guidance": legal_guidance,
        "related_judgments": judgments
    }
