from pydantic import BaseModel

class SearchRequest(BaseModel):
    issue: str
