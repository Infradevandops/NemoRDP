import sys
import os

# Add the current directory to the python path so imports work
sys.path.append(os.getcwd())

from backend.database.connection import SessionLocal
from backend.models.user import User
from backend.models.rdp_instance import RDPInstance
from backend.models.payment import Payment
from backend.models.ticket import Ticket
from backend.core.security import get_password_hash

def create_test_user():
    db = SessionLocal()
    email = "test@example.com"
    password = "password123"
    
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User {email} already exists. Updating password...")
            existing_user.hashed_password = get_password_hash(password)
            db.commit()
            print("Password updated successfully.")
        else:
            new_user = User(
                email=email,
                hashed_password=get_password_hash(password),
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print(f"User {email} created successfully.")
            
        print("\nLogin Credentials:")
        print(f"Email: {email}")
        print(f"Password: {password}")
        
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
