import requests
import json
import jwt # pyjwt
import sys

API_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "password123"
NEW_EMAIL = "unverified@example.com"
NEW_PASSWORD = "password123"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def login(email, password):
    print(f"Logging in as {email}...")
    try:
        if "test" in email: # Use existing test user logic if needed, but endpoint is same
            response = requests.post(f"{API_URL}/auth/login", data={"username": email, "password": password})
        else:
             response = requests.post(f"{API_URL}/auth/login", data={"username": email, "password": password})
        
        if response.status_code == 200:
            print("Login success")
            return response.json()["access_token"]
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def verify_token_claims(token):
    print("Verifying token claims...")
    try:
        # Decode without verification just to see payload
        decoded = jwt.decode(token, options={"verify_signature": False})
        print(f"Token Payload: {decoded}")
        if "is_verified" in decoded:
             print(f"✅ is_verified claim present: {decoded['is_verified']}")
             return decoded['is_verified']
        else:
             print("❌ is_verified claim MISSING")
             return None
    except Exception as e:
        print(f"Token decode error: {e}")
        return None

def test_deployment(token, expected_status=200):
    print(f"Testing Deployment access (Expected: {expected_status})...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "plan": "basic",
        "duration": "hourly",
        "hours": 2,
        "payment_method": "crypto",
        "crypto_type": "USDT",
        "os_type": "linux",
        "location": "US"
    }
    try:
        response = requests.post(f"{API_URL}/billing/initiate", json=payload, headers=headers)
        print(f"Response: {response.status_code} - {response.text}")
        if response.status_code == expected_status:
            print("✅ Status matches expectation")
        else:
            print(f"❌ Status mismatch! Expected {expected_status}, got {response.status_code}")
    except Exception as e:
        print(f"Request error: {e}")

def main():
    # 1. Register Unverified User
    print_step("Registering Unverified User")
    response = requests.post(f"{API_URL}/auth/register", json={"email": NEW_EMAIL, "password": NEW_PASSWORD})
    if response.status_code == 200:
        print("Registration success")
        unverified_token = response.json()["access_token"]
    elif response.status_code == 400:
        print("User already exists, logging in...")
        unverified_token = login(NEW_EMAIL, NEW_PASSWORD)
    else:
        print(f"Registration failed: {response.text}")
        # Try login just in case
        unverified_token = login(NEW_EMAIL, NEW_PASSWORD)

    if not unverified_token:
        print("❌ Could not get token for unverified user. Aborting.")
        return

    # 2. Check Unverified Claims
    print_step("Checking Unverified Token Claims")
    is_verified = verify_token_claims(unverified_token)
    if is_verified is False:
        print("✅ Correctly identified as NOT verified")
    else:
        print(f"❌ Unexpected verification status: {is_verified}")

    # 3. Try to Deploy (Should Fail)
    print_step("Attempting Deployment as Unverified User")
    test_deployment(unverified_token, expected_status=403)

    # 4. Login as Verified Test User
    print_step("Logging in as Verified Test User")
    # First ensure test user exists and is verified (run script or rely on previous steps)
    # We will assume create_test_user.py was run or we run it now? 
    # Let's just try login, if fails we know why.
    verified_token = login(TEST_EMAIL, TEST_PASSWORD)
    if not verified_token:
         print("❌ Verified user login failed. Run 'python scripts/create_test_user.py' first.")
         return

    # 5. Check Verified Claims
    print_step("Checking Verified Token Claims")
    is_verified_2 = verify_token_claims(verified_token)
    if is_verified_2 is True:
        print("✅ Correctly identified as VERIFIED")
    else:
        print(f"❌ Unexpected verification status: {is_verified_2}")

    # 6. Try to Deploy (Should Succeed)
    print_step("Attempting Deployment as Verified User")
    test_deployment(verified_token, expected_status=200)

if __name__ == "__main__":
    main()
