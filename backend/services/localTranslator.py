from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from langdetect import detect

MODEL_NAME = "facebook/nllb-200-distilled-600M"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

model.eval()
torch.set_grad_enabled(False)

LANG_MAP = {
    "hi": "hin_Deva",
    "mr": "mar_Deva",
    "en": "eng_Latn"
}

def translate_to_english(text: str) -> str:
    if not text:
        return text

    text = text.strip()
    if len(text) > 600:
        text = text[:600]

    try:
        lang = detect(text)
    except:
        lang = "en"

    src_lang = LANG_MAP.get(lang, "eng_Latn")

    # ✅ THIS is the fix
    tokenizer.src_lang = src_lang

    inputs = tokenizer(text, return_tensors="pt", truncation=True)

    output = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id["eng_Latn"],
        max_length=128,
        num_beams=1,
        do_sample=False
    )

    return tokenizer.batch_decode(output, skip_special_tokens=True)[0].strip()
