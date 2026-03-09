from dotenv import load_dotenv
import os

load_dotenv()

INDIANKANOON_API_KEY = os.getenv("INDIANKANOON_API_KEY")

if not INDIANKANOON_API_KEY:
    raise RuntimeError("Indian Kanoon API key not found in environment")