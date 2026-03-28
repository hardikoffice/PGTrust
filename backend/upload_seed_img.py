import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

image_path = r"C:\Users\Hardik\.gemini\antigravity\brain\51946bf9-d3eb-4686-a5f5-7581582abbef\premium_pg_room_1774729411319.png"

try:
    result = cloudinary.uploader.upload(
        image_path,
        folder="pg_trust/seed",
        public_id="premium_pg_room"
    )
    url = result['secure_url']
    with open("d:/PG Trust/backend/cloudinary_url.txt", "w") as f:
        f.write(url)
    print(f"SUCCESS: {url}")
except Exception as e:
    print(f"ERROR: {str(e)}")
