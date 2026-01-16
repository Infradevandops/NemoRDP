import requests
import sys

BASE_URL = "http://localhost:8000"
EMAIL = "test@example.com"
PASSWORD = "password123"

def verify_login():
    print(f"Attempting to log in to {BASE_URL} as {EMAIL}...")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={"username": EMAIL, "password": PASSWORD},  # OAuth2PasswordRequestForm uses 'username' for email
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            if "access_token" in token_data:
                print("✅ Login SUCCESSful!")
                print(f"Access Token: {token_data['access_token'][:20]}...")
                return True
            else:
                print("❌ Login failed: No access token in response.")
                print(response.json())
                return False
        else:
            print(f"❌ Login failed with status code {response.status_code}")
            print(response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Could not connect to {BASE_URL}. Is the backend running?")
        return False
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        return False

if __name__ == "__main__":
    success = verify_login()
    if not success:
        sys.exit(1)
