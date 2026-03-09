import json
import re
from services.gemini_service import ask_gemini
from services.ipcDatabase import IPC_DATABASE


def extract_sections(text):

    pattern = r"\b\d{2,4}[A-Z]?\b"
    matches = re.findall(pattern, text)

    return matches

def ai_predict_sections(issue_text):

    prompt = f"""
You are an expert in Indian criminal law.

Analyze the following legal issue and identify relevant IPC sections.

Rules:
- Return ONLY valid JSON
- Do NOT explain
- Only list section numbers

JSON format:

{{
"ipc_sections": ["302","307"]
}}

Issue:
{issue_text}
"""

    response = ask_gemini(prompt)

    if not response:
        return []

    try:
        match = re.search(r"\{.*\}", response, re.DOTALL)
        data = json.loads(match.group(0))

        return data.get("ipc_sections", [])

    except:
        return []


def map_sections(issue_text):

    detected_sections = []

    ai_sections = ai_predict_sections(issue_text)

    for section in ai_sections:

        if section in IPC_DATABASE:
            detected_sections.append(section)

    ipc_output = []
    bns_output = []

    for section in detected_sections:

        rule = IPC_DATABASE[section]

        ipc_output.append({
            "section": f"{section} IPC",
            "title": rule["title"]
        })

        if rule.get("bns"):
            bns_output.append({
                "section": f"{rule['bns']} BNS",
                "title": rule["title"]
            })

    return {
        "confidence":"AI-Detected",
        "ipc_sections":ipc_output,
        "bns_sections":bns_output
    }