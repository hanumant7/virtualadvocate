import re
from services.aiIpcPredictor import map_sections
from services.ipcDatabase import IPC_DATABASE

# HELPER
def keyword_match(text, keywords):
    for word in keywords:
        if re.search(rf"\b{re.escape(word)}\b", text):
            return True
    return False

# RULE-BASED CRIME DETECTION
CRIME_RULES = {
# MURDER
"murder": {
"keywords":{
"en":["murder","killed","kill","homicide"],
"hi":["हत्या","खून","मार दिया"],
"mr":["हत्या","खून","मारला"]
},
"ipc":["302","299"],
"confidence":"High"
},

# ATTEMPT MURDER
"attempt_murder":{
"keywords":{
"en":["attempt to kill","tried to kill"],
"hi":["मारने की कोशिश"],
"mr":["मारण्याचा प्रयत्न"]
},
"ipc":["307"],
"confidence":"High"
},

# HURT / ASSAULT
"hurt":{
"keywords":{
"en":["hit","hurt","beaten","injured"],
"hi":["मारपीट","चोट"],
"mr":["मारहाण","जखमी"]
},
"ipc":["323","351","352"],
"confidence":"Medium"
},

# SEXUAL CRIMES
"rape":{
"keywords":{
"en":["rape","raped"],
"hi":["बलात्कार"],
"mr":["बलात्कार"]
},
"ipc":["376"],
"confidence":"High"
},

"sexual_harassment":{
"keywords":{
"en":["sexual harassment","molestation"],
"hi":["छेड़छाड़"],
"mr":["छेडछाड"]
},
"ipc":["354","354A"],
"confidence":"High"
},

"stalking":{
"keywords":{
"en":["stalking","followed me"],
"hi":["पीछा किया"],
"mr":["पाठलाग"]
},
"ipc":["354D"],
"confidence":"Medium"
},

# THEFT / ROBBERY
"theft":{
"keywords":{
"en":["theft","stole","stealing"],
"hi":["चोरी"],
"mr":["चोरी"]
},
"ipc":["378","379"],
"confidence":"High"
},

"robbery":{
"keywords":{
"en":["robbery","snatched","looted"],
"hi":["लूट","डकैती"],
"mr":["लुट","दरोडा"]
},
"ipc":["392","390"],
"confidence":"High"
},

"dacoity":{
"keywords":{
"en":["dacoity","gang robbery"],
"hi":["डकैती"],
"mr":["दरोडा"]
},
"ipc":["395"],
"confidence":"High"
},

# FRAUD / CHEATING
"cheating":{
"keywords":{
"en":["cheat","fraud","scam"],
"hi":["धोखाधड़ी"],
"mr":["फसवणूक"]
},
"ipc":["420","415"],
"confidence":"High"
},

"forgery":{
"keywords":{
"en":["fake document","forged","fake signature"],
"hi":["जाली दस्तावेज"],
"mr":["बनावट कागदपत्र"]
},
"ipc":["463","468","471"],
"confidence":"Medium"
},

# FAMILY CRIMES
"domestic_violence":{
"keywords":{
"en":["domestic violence","husband beat"],
"hi":["घरेलू हिंसा"],
"mr":["घरगुती हिंसा"]
},
"ipc":["498A"],
"confidence":"High"
},

"dowry":{
"keywords":{
"en":["dowry","dowry harassment"],
"hi":["दहेज"],
"mr":["हुंडा"]
},
"ipc":["304B"],
"confidence":"High"
},

# THREATS
"criminal_intimidation":{
"keywords":{
"en":["threat","threatened","kill threat"],
"hi":["धमकी"],
"mr":["धमकी"]
},
"ipc":["503","506"],
"confidence":"Medium"
},

# WOMEN PROTECTION
"insult_modesty":{
"keywords":{
"en":["insult modesty","abused woman"],
"hi":["महिला का अपमान"],
"mr":["महिलेचा अपमान"]
},
"ipc":["509"],
"confidence":"Medium"
}

}


# RULE-BASED MAPPER
def rule_based_mapping(text):

    detected_sections = []
    confidence = "Low"

    for rule in CRIME_RULES.values():

        for lang_words in rule["keywords"].values():

            if keyword_match(text, lang_words):

                detected_sections.extend(rule["ipc"])
                confidence = rule["confidence"]

    return detected_sections, confidence

# BUILD IPC / BNS OUTPUT
def build_output(section_list):

    ipc_output = []
    bns_output = []

    for section in section_list:

        if section in IPC_DATABASE:

            data = IPC_DATABASE[section]

            ipc_output.append({
                "section": f"{section} IPC",
                "title": data["title"]
            })

            if data.get("bns"):
                bns_output.append({
                    "section": f"{data['bns']} BNS",
                    "title": data["title"]
                })

    return ipc_output, bns_output

# MAIN HYBRID MAPPER
def map_statute_sections(original_issue: str, processed_issue: str):

    combined_text = f"{original_issue} {processed_issue}".lower()

    # RULE-BASED DETECTION
    rule_sections, rule_confidence = rule_based_mapping(combined_text)

    # AI DETECTION
    ai_result = map_sections(combined_text)

    ai_sections = [
        s["section"].split()[0]
        for s in ai_result.get("ipc_sections", [])
    ]

    # MERGE RESULTS
    merged_sections = list(set(rule_sections + ai_sections))

    if not merged_sections:
        return {
            "confidence": "Low",
            "ipc_sections": [],
            "bns_sections": []
        }

    ipc_output, bns_output = build_output(merged_sections)

    return {
        "confidence": rule_confidence if rule_sections else "AI-Detected",
        "ipc_sections": ipc_output,
        "bns_sections": bns_output
    }