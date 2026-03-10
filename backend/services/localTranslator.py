from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from langdetect import detect
import torch
from services.gemini_service import generate_reply

# CONFIGURATION
USE_NLLB = False   # Keep NLLB code but disable it

MODEL_NAME = "facebook/nllb-200-distilled-600M"

_tokenizer = None
_model = None

LANG_MAP = {
    "hi": "hin_Deva",
    "mr": "mar_Deva",
    "en": "eng_Latn"
}

# NLLB MODEL LOADER
def get_model():
    global _tokenizer, _model

    if _model is None:

        print("Loading NLLB model...")

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

        _model.eval()
        torch.set_grad_enabled(False)

        print("NLLB model loaded")

    return _tokenizer, _model

# LANGUAGE DETECTION
def detect_language(text: str):

    try:
        return detect(text)
    except:
        return "en"

# GEMINI TRANSLATION
def gemini_translate(text: str):

    try:

        prompt = f"""
Translate the following text to English.

Return only the translated text.

{text}
"""

        result = generate_reply(prompt)

        if isinstance(result, dict):
            return result.get("text", text)

        return result

    except Exception as e:

        print("Gemini translation error:", e)

        return text

# MAIN TRANSLATION FUNCTION
def translate_to_english(text: str):

    if not text:
        return text

    text = text.strip()[:500]

    lang = detect_language(text)

    if lang == "en":
        return text

    # If NLLB is enabled
    if USE_NLLB:

        tokenizer, model = get_model()

        tokenizer.src_lang = LANG_MAP.get(lang, "eng_Latn")

        inputs = tokenizer(text, return_tensors="pt", truncation=True)

        output = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.lang_code_to_id["eng_Latn"],
            max_length=128
        )

        return tokenizer.batch_decode(output, skip_special_tokens=True)[0]

    # Default: Gemini translation
    return gemini_translate(text)
