from transformers import pipeline

_classifier = None

def get_classifier():
    global _classifier

    if _classifier is None:
        _classifier = pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli"
        )

    return _classifier

LEGAL_LABELS = [
    "Violent crime such as murder, assault, rape or physical attack",
    "Financial fraud or cheating including scam or money fraud",
    "Cyber crime involving hacking, phishing or online fraud",
    "Property dispute involving land ownership or property conflict",
    "Family dispute involving divorce, marriage, custody or maintenance",
    "Consumer complaint about product or service",
    "Employment dispute related to job, salary or workplace"
]

def classify_issue(text: str):

    if not text or len(text.strip()) < 5:
        return "General", 0.0

    classifier = get_classifier()

    result = classifier(
        text,
        LEGAL_LABELS,
        hypothesis_template="This legal issue is about {}."
    )

    label = result["labels"][0]
    score = float(result["scores"][0])

    # Map label to final category
    if "Violent crime" in label:
        return "Criminal", round(score, 2)

    if "Financial fraud" in label:
        return "Criminal", round(score, 2)

    if "Cyber crime" in label:
        return "Cyber Crime", round(score, 2)

    if "Property dispute" in label:
        return "Civil", round(score, 2)

    if "Family dispute" in label:
        return "Family", round(score, 2)

    if "Consumer complaint" in label:
        return "Consumer", round(score, 2)

    if "Employment dispute" in label:
        return "Civil", round(score, 2)

    return "General", round(score, 2)
