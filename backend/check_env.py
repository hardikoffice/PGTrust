from app.core.config import settings
import os

print(f"Current Working Directory: {os.getcwd()}")
print(f".env exists: {os.path.exists('.env')}")
print(f"GEMINI_API_KEY in settings: {'Configured' if settings.gemini_api_key else 'NOT Configured'}")
if settings.gemini_api_key:
    # Print first and last few chars for verification without exposing the whole key
    key = settings.gemini_api_key
    print(f"Key preview: {key[:5]}...{key[-5:]}")
else:
    # Check if it exists in os.environ as a fallback
    print(f"GEMINI_API_KEY in os.environ: {'Configured' if 'GEMINI_API_KEY' in os.environ else 'NOT Configured'}")
