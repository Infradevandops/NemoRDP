import requests
import sys

# Login first
base_url = "http://localhost:8000"
login_data = {"username": "test@example.com", "password": "password123"}

try:
    print("Logging in...")
    resp = requests.post(f"{base_url}/auth/login", data=login_data)
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        sys.exit(1)
        
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Accessing Admin Stats...")
    stats_resp = requests.get(f"{base_url}/admin/stats", headers=headers)
    
    if stats_resp.status_code == 200:
        print("✅ Admin Stats Access GRANTED")
        print(f"Stats: {stats_resp.json()}")
    elif stats_resp.status_code == 403:
        print("❌ Admin Stats Access DENIED (403) - Correct behavior if not admin, but we expect allow for test user")
    else:
        print(f"❌ Admin Stats Failed: {stats_resp.status_code} {stats_resp.text}")
        
    print("Accessing Admin Users...")
    users_resp = requests.get(f"{base_url}/admin/users", headers=headers)
    if users_resp.status_code == 200:
        print(f"✅ Users List Access GRANTED (Count: {len(users_resp.json())})")
    else:
        print(f"❌ Users List Failed: {users_resp.status_code} {users_resp.text}")

except Exception as e:
    print(f"Error: {e}")
