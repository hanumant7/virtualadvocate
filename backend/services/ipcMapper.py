CRIME_RULES = {
    "murder": {
        "keywords": {
            "en": ["murder", "killed", "homicide", "kill"],
            "hi": ["खून", "हत्या", "मार दिया", "मार डाला"],
            "mr": ["खून", "हत्या", "मारले", "मारला"]
        },
        "confidence": "High",
        "ipc": [
            {"section": "302 IPC", "title": "Punishment for Murder"},
            {"section": "299 IPC", "title": "Culpable Homicide"}
        ],
        "bns": [
            {"section": "101 BNS", "title": "Punishment for Murder"}
        ]
    },

    "rape": {
        "keywords": {
            "en": ["rape", "raped", "sexual assault"],
            "hi": ["बलात्कार"],
            "mr": ["बलात्कार"]
        },
        "confidence": "High",
        "ipc": [
            {"section": "376 IPC", "title": "Punishment for Rape"}
        ],
        "bns": [
            {"section": "64 BNS", "title": "Rape"}
        ]
    },

    "theft": {
        "keywords": {
            "en": ["theft", "stole", "stealing"],
            "hi": ["चोरी"],
            "mr": ["चोरी"]
        },
        "confidence": "High",
        "ipc": [
            {"section": "378 IPC", "title": "Theft"},
            {"section": "379 IPC", "title": "Punishment for Theft"}
        ],
        "bns": [
            {"section": "303 BNS", "title": "Theft"}
        ]
    },

    "cheating": {
        "keywords": {
            "en": ["cheat", "cheating", "fraud"],
            "hi": ["धोखाधड़ी", "ठगी"],
            "mr": ["फसवणूक"]
        },
        "confidence": "Medium",
        "ipc": [
            {"section": "420 IPC", "title": "Cheating"}
        ],
        "bns": [
            {"section": "316 BNS", "title": "Cheating"}
        ]
    },

    "assault": {
        "keywords": {
            "en": ["assault", "attacked", "beaten"],
            "hi": ["मारपीट", "हमला"],
            "mr": ["मारहाण", "हल्ला"]
        },
        "confidence": "Medium",
        "ipc": [
            {"section": "351 IPC", "title": "Assault"},
            {"section": "352 IPC", "title": "Punishment for Assault"}
        ],
        "bns": [
            {"section": "115 BNS", "title": "Assault"}
        ]
    }
}

def map_statute_sections(original_issue: str, processed_issue: str):
    original = (original_issue or "").lower()
    text = (processed_issue or "").lower()

    for crime, rule in CRIME_RULES.items():
        for lang_keywords in rule["keywords"].values():
            if any(word in original for word in lang_keywords) or any(word in text for word in lang_keywords):
                return {
                    "confidence": rule["confidence"],
                    "ipc_sections": rule["ipc"],
                    "bns_sections": rule["bns"]
                }

    return {
        "confidence": "Low",
        "ipc_sections": [],
        "bns_sections": []
    }
