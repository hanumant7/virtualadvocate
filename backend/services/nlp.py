from transformers import pipeline

# Cache the classifier to avoid reloading
_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = pipeline(
            "zero-shot-classification",
            model="typeform/distilbert-base-uncased-mnli"
        )
    return _classifier


def classify_issue(text: str):
    """
    Classifies a legal issue into a broad legal category
    and returns both category and confidence sacore.
    """

    if not text or len(text.strip()) < 5:
        return "General", 0.0

    labels = [
        "Consumer",
        "Criminal",
        "Civil",
        "Family",
        # "Cyber Crime"
    ]

    classifier = get_classifier()
    result = classifier(text, labels)

    best_label = result["labels"][0]
    best_score = float(result["scores"][0])

    return best_label, round(best_score, 2)

