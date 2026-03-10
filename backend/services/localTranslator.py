from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from langdetect import detect
import torch

# MODEL CONFIGURATION
MODEL_NAME = "facebook/nllb-200-distilled-300M"

_tokenizer = None
_model = None

# Reduce CPU usage for small containers
torch.set_grad_enabled(False)
torch.set_num_threads(1)

# Language mapping
LANG_MAP = {
    "hi": "hin_Deva",
    "mr": "mar_Deva",
    "en": "eng_Latn"
}

# LOAD MODEL (ONLY ONCE)
def get_model():
    global _tokenizer, _model

    if _model is None:
        print("Loading NLLB translation model...")

        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

        _model.eval()

        print("Translation model loaded")

    return _tokenizer, _model

# LANGUAGE DETECTION
def detect_language(text: str):

    try:
        return detect(text)
    except Exception:
        return "en"

# TRANSLATE TO ENGLISH
def translate_to_english(text: str):

    if not text:
        return text

    # Limit input size to avoid slow generation
    text = text.strip()[:500]

    lang = detect_language(text)

    # If already English, skip translation
    if lang == "en":
        return text

    tokenizer, model = get_model()

    tokenizer.src_lang = LANG_MAP.get(lang, "eng_Latn")

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True
    )

    output = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id["eng_Latn"],
        max_length=128
    )

    translated = tokenizer.batch_decode(
        output,
        skip_special_tokens=True
    )[0]

    return translated

# GENERIC TRANSLATION
def translate_text(text: str, target_lang: str):

    if not text:
        return text

    if target_lang == "en":
        return text

    tokenizer, model = get_model()

    tokenizer.src_lang = "eng_Latn"

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True
    )

    output = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id[
            LANG_MAP.get(target_lang, "eng_Latn")
        ],
        max_length=128
    )

    translated = tokenizer.batch_decode(
        output,
        skip_special_tokens=True
    )[0]

    return translated
