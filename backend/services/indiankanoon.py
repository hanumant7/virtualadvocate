import requests
from config import INDIANKANOON_API_KEY


def search_cases(query, skip_first=False):

    if not query:
        return []

    url = "https://api.indiankanoon.org/search/"

    headers = {
        "Authorization": f"Token {INDIANKANOON_API_KEY}"
    }

    params = {
        "formInput": query,
        "pagenum": 0
    }

    try:
        response = requests.post(url, headers=headers, data=params)
        print("Indian Kanoon Query:", query)
        print("Response Status:", response.status_code)

        if response.status_code != 200:
            print("API Error:", response.text)
            return []

        data = response.json()

        docs = data.get("docs", [])

        if skip_first:
            docs = docs[1:]

        results = []

        for doc in docs[:5]:
            title = doc.get("title", "Untitled Case")
            doc_id = doc.get("tid")

            if doc_id:
                results.append({
                    "title": title,
                    "link": f"https://indiankanoon.org/doc/{doc_id}/"
                })

        print("Judgments Found:", len(results))

        return results

    except Exception as e:
        print("Indian Kanoon Error:", str(e))
        return []