import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.owner import Owner
from app.models.pg_listing import PGListing
from app.models.enums import Role, GenderPreference

def seed():
    db = SessionLocal()
    try:
        # Find an owner
        owner = db.execute(select(Owner)).scalars().first()
        if not owner:
            print("No owner found. Creating one...")
            user = User(
                email="dummyowner@pgtrust.com",
                password_hash="dummy",
                full_name="Dummy Owner",
                role=Role.OWNER
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            owner = Owner(user_id=user.id, business_name="Dummy PG Services")
            db.add(owner)
            db.commit()
        
        pgs = [
            {
                "name": "Amber Heights PG",
                "location": "Indiranagar, Bengaluru, Karnataka",
                "rent": 12500,
                "rating": 4.5,
                "amenities": ["WiFi", "AC", "Laundry", "Gym"],
                "images": ["https://res.cloudinary.com/dpwkfbalx/image/upload/v1774729462/pg_trust/seed/premium_pg_room.jpg"],
                "gender_preference": GenderPreference.ANY,
                "description": "Premium stay with all modern amenities in the heart of Indiranagar."
            },
            {
                "name": "Zinc Living",
                "location": "HSR Layout, Bengaluru, Karnataka",
                "rent": 11000,
                "rating": 4.2,
                "amenities": ["WiFi", "Cleaning", "Power Backup"],
                "images": ["https://res.cloudinary.com/dpwkfbalx/image/upload/v1774729462/pg_trust/seed/premium_pg_room.jpg"],
                "gender_preference": GenderPreference.MALE,
                "description": "Affordable and clean living space for professionals."
            },
            {
                "name": "Starlight PG",
                "location": "Sector 62, Noida, UP",
                "rent": 9500,
                "rating": 4.0,
                "amenities": ["WiFi", "Food", "AC"],
                "images": ["https://res.cloudinary.com/dpwkfbalx/image/upload/v1774729462/pg_trust/seed/premium_pg_room.jpg"],
                "gender_preference": GenderPreference.FEMALE,
                "description": "Safe and hygienic PG for girls near corporate hubs."
            },
            {
                "name": "Comfort Stay",
                "location": "Gachibowli, Hyderabad, Telangana",
                "rent": 13000,
                "rating": 4.7,
                "amenities": ["WiFi", "Gym", "Parking"],
                "images": ["https://res.cloudinary.com/dpwkfbalx/image/upload/v1774729462/pg_trust/seed/premium_pg_room.jpg"],
                "gender_preference": GenderPreference.ANY,
                "description": "Luxury PG with spacious rooms and top-tier amenities."
            },
            {
                "name": "The Hub PG",
                "location": "Saket, Delhi, NCR",
                "rent": 15000,
                "rating": 4.8,
                "amenities": ["WiFi", "Balcony", "Private Kitchen"],
                "images": ["https://res.cloudinary.com/dpwkfbalx/image/upload/v1774729462/pg_trust/seed/premium_pg_room.jpg"],
                "gender_preference": GenderPreference.ANY,
                "description": "Modern studio-style living in a prime location."
            }
        ]

        for pg_data in pgs:
            # Check if exists
            exists = db.execute(select(PGListing).where(PGListing.name == pg_data["name"])).scalar_one_or_none()
            if not exists:
                pg = PGListing(
                    owner_id=owner.user_id,
                    **pg_data
                )
                db.add(pg)
        
        db.commit()
        print("Seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
