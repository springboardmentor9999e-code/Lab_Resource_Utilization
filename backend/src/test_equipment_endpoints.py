import requests

base_url = 'http://localhost:8080'

login_url = f'{base_url}/api/auth/login'
credentials = {
    'email': 'admin@labhub.com',
    'password': 'Admin@12345'
}

response = requests.post(login_url, json=credentials)
token = response.json()['data']['token']

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Test 1: Categories
print("\n--- Testing Categories Endpoint ---")
r_cat = requests.get(f'{base_url}/api/equipment/categories', headers=headers)
print(f"Status: {r_cat.status_code}")
try:
    print(r_cat.json())
except:
    print(r_cat.text)

# Test 2: Equipment with status=AVAILABLE
print("\n--- Testing Equipment with status=AVAILABLE ---")
r_status = requests.get(f'{base_url}/api/equipment?status=AVAILABLE', headers=headers)
print(f"Status: {r_status.status_code}")
try:
    print(r_status.json())
except:
    print(r_status.text)

# Test 3: Equipment with search=Microscope
print("\n--- Testing Equipment with search=Microscope ---")
r_search = requests.get(f'{base_url}/api/equipment?search=Microscope', headers=headers)
print(f"Status: {r_search.status_code}")
try:
    print(r_search.json())
except:
    print(r_search.text)
