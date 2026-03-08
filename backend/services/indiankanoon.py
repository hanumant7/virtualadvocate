import requests
from config import INDIANKANOON_API_KEY

BASE_URL = "https://api.indiankanoon.org"

HEADERS = {
    "Authorization": f"Token {INDIANKANOON_API_KEY}",
}

def search_cases(query: str, skip_first: bool = False):
    if not query:
        return []

    url = f"{BASE_URL}/search/"

    data = {
        "formInput": query,
        "pagenum": 0,
        "maxpages": 1,
        "doctypes": "judgments"
    }

    try:
        response = requests.post(url, data=data, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print("Indian Kanoon request failed:", e)
        return []

    result = response.json()

    docs = (
        result.get("results")
        or result.get("documents")
        or result.get("docs")
        or []
    )

    output = []

    for doc in docs:
        title = (
            doc.get("title")
            or doc.get("caseName")
            or doc.get("heading")
            or "Untitled Case"
        )

        doc_id = (
            doc.get("id")
            or doc.get("docId")
            or doc.get("docid")
            or doc.get("_id")
            or doc.get("tid")
        )

        if doc_id:
            output.append({
                "title": title,
                "link": f"https://indiankanoon.org/doc/{doc_id}/"
            })

    # 🔥 Skip first generic result if requested
    if skip_first and len(output) > 1:
        output = output[1:]

    return output[:3]
