from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

# INTERNAL SERVICE IMPORTS
from schemas.search import SearchRequest
from services.analyzer import analyze_case
from services.indiankanoon import search_cases
from services.localTranslator import translate_to_english
from services.gemini_service import generate_reply, generate_case_title

# APP INITIALIZATION
app = FastAPI(
    title="Virtual Advocate Backend",
    description="Backend API for Virtual Advocate Legal-Tech Project",
    version="2.0"
)

# CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# DATA MODELS
class ChatRequest(BaseModel):
    message: str
    user_id: str
    history: list | None = None

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


# CHAT ENDPOINT
@app.post("/chat")
def gemini_chat(data: ChatRequest):
    """
    Gemini chatbot endpoint

    Features:
    - conversation memory
    - structured legal responses
    - greeting conversation
    - language mirroring
    """

    try:

        message = data.message.strip()

        if not message:
            return {
                "type": "text",
                "content": "Please enter a message."
            }

        history = data.history[-12:] if data.history else []

        print("CHAT MESSAGE:", message)
        print("History messages:", len(history))

        reply = generate_reply(
            user_message=message,
            history=history
        )

        print("CHAT RESPONSE:", reply)

        return reply

    except Exception as e:

        print("Chat error:", e)

        return {
            "type": "text",
            "content": "Unable to process the request right now."
        }

# AI CASE TITLE GENERATOR
@app.post("/generate-title")
def generate_title(data: ChatRequest):

    try:

        message = data.message.strip()

        if not message:
            return {"title": "Legal Consultation"}

        title = generate_case_title(message)

        print("Generated title:", title)

        return {
            "title": title
        }

    except Exception as e:

        print("Title generation error:", e)

        return {
            "title": "Legal Consultation"
        }

# ANALYZER (CORE)
@app.post("/analyze")
def analyze(request: SearchRequest):
    """
    Unified analysis endpoint

    Steps:
    1️⃣ Translate user query to English
    2️⃣ Run legal classification
    3️⃣ Detect IPC/BNS sections
    4️⃣ Generate legal guidance
    5️⃣ Fetch related judgments
    """

    print("STEP 1: request received")

    original_issue = request.issue

    # Translation step
    try:
        processed_issue = translate_to_english(original_issue)
        print("STEP 2: translation done")
    except Exception as e:
        print("Translation error:", e)
        processed_issue = original_issue
        print("STEP 2: translation skipped")

    print("STEP 3: calling analyzer")

    try:
        result = analyze_case({
            "issue": processed_issue,
            "original_issue": original_issue
        })

        print("STEP 4: analyzer finished")

        return result

    except Exception as e:

        print("Analyzer error:", e)

        raise HTTPException(
            status_code=500,
            detail="Error processing legal analysis"
        )

# LEGAL SEARCH ENDPOINT
@app.post("/legal-search")
def legal_search(request: SearchRequest):

    try:

        judgments = search_cases(request.issue)

        return {
            "judgments": judgments
        }

    except Exception as e:

        print("Legal search error:", e)

        raise HTTPException(
            status_code=500,
            detail="Error fetching judgments"
        )

# FILE UPLOAD
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

# AUTH ENDPOINTS
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

    return {
        "message": f"Account created for {user.name} successfully"
    }

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

# ROOT ENDPOINT
@app.get("/")
def root():

    return {
        "status": "Virtual Advocate Backend is running (v2.0)"
    }
