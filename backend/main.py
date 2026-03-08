from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import re

# ------------------------------
# INTERNAL SERVICE IMPORTS
# ------------------------------
from schemas.search import SearchRequest
from services.analyzer import analyze_case
from services.indiankanoon import search_cases
from services.localTranslator import translate_to_english
from services.gemini_service import generate_reply

# ------------------------------
# APP INITIALIZATION
# ------------------------------
app = FastAPI(
    title="Virtual Advocate Backend",
    description="Backend API for Virtual Advocate Legal-Tech Project",
    version="2.0"
)

# ------------------------------
# CORS CONFIGURATION
# ------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# ===================== DATA MODELS =======================
# =========================================================

class ChatRequest(BaseModel):
    message: str
    user_id: str

class UserSignUp(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: str
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: str
    password: str

class AdviceRequest(BaseModel):
    case_type: str
    description: str

# =========================================================
# ===================== CHAT ENDPOINTS ====================
# =========================================================

import json

@app.post("/chat")
def gemini_chat(data: ChatRequest):
    try:
        raw_reply = generate_reply(data.message)
        cleaned = raw_reply.strip().replace("```json", "").replace("```", "")
        structured = json.loads(cleaned)

        return {
            "type": "structured",
            "content": structured
        }

    except Exception:
        return {
            "type": "text",
            "content": "Unable to process request."
        }



# =========================================================
# ===================== ANALYZER (CORE) ===================
# =========================================================

@app.post("/analyze")
def analyze(request: SearchRequest):
    """
    Unified analysis endpoint:
    - Auto-translate (Hindi/Marathi → English)
    - NLP classification
    - IPC + BNS mapping
    - Legal guidance
    - Related judgments
    """

    original_issue = request.issue

    try:
        processed_issue = translate_to_english(original_issue)
    except Exception:
        processed_issue = original_issue  # fail-safe

    return analyze_case({
        "issue": processed_issue,
        "original_issue": original_issue
    })

# =========================================================
# ========== OPTIONAL: JUDGMENT-ONLY SEARCH ===============
# =========================================================

@app.post("/legal-search")
def legal_search(request: SearchRequest):
    return {
        "judgments": search_cases(request.issue)
    }

# =========================================================
# ===================== FILE UPLOAD =======================
# =========================================================

@app.post("/submit-for-advice")
async def submit_advice(
    case_type: str,
    description: str,
    file: UploadFile = File(None)
):
    return {
        "status": "success",
        "case_type": case_type,
        "description": description,
        "file_received": file.filename if file else "No file uploaded"
    }

# =========================================================
# ===================== AUTH ENDPOINTS ====================
# =========================================================

@app.post("/signup")
def register_user(user: UserSignUp):

    if len(user.name.strip()) < 3:
        raise HTTPException(status_code=400, detail="Name must be at least 3 characters")

    if user.age < 18 or user.age > 100:
        raise HTTPException(status_code=400, detail="Age must be between 18 and 100")

    if user.gender.lower() not in ["male", "female", "other"]:
        raise HTTPException(status_code=400, detail="Invalid gender value")

    if not re.fullmatch(r"[6-9]\d{9}", user.phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")

    if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", user.email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    return {"message": f"Account created for {user.name} successfully"}


@app.post("/login")
def login_user(user: UserLogin):

    if not user.email or not user.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", user.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    return {
        "message": "Login successful",
        "user_email": user.email
    }

# =========================================================
# ===================== ROOT CHECK ========================
# =========================================================

@app.get("/")
def root():
    return {"status": "Virtual Advocate Backend is running (v2.0)"}